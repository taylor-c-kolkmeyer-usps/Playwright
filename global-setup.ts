import path from 'node:path';
import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { resolveIbpsTokenUser } from './utils/users';

type RuntimeEnv = Record<string, string | undefined>;

const env = (globalThis as { process?: { env?: RuntimeEnv } }).process?.env ?? {};
const STORAGE_STATE_PATH = path.resolve(__dirname, 'storageState.json');

function requireEnv(name: string): string {
        const value = env[name];
        if (!value) {
                throw new Error(`Missing required environment variable: ${name}`);
        }
        return value;
}

function optionalEnv(name: string): string | undefined {
        const value = env[name]?.trim();
        return value || undefined;
}

function findTokenDeep(value: unknown): string | null {
        const asText = typeof value === 'string' ? value : JSON.stringify(value);
        const normalized = asText
                .replaceAll('&quot;', '"')
                .replaceAll('&#34;', '"')
                .replaceAll('&amp;', '&');

        const regexToken = /"token"\s*:\s*"([^"]+)"/i.exec(normalized);
        return regexToken?.[1]?.trim() || null;
}

function extractToken(raw: string): string {
        const trimmed = raw.trim();
        const dequoted = trimmed
                .replaceAll('&quot;', '"')
                .replaceAll('&#34;', '"')
                .replaceAll('&amp;', '&');

        const parseCandidates = [trimmed, dequoted];

        for (const candidate of parseCandidates) {
                try {
                        const parsed = JSON.parse(candidate) as unknown;

                        if (typeof parsed === 'string' && parsed.trim()) {
                                return parsed.trim();
                        }

                        const deepToken = findTokenDeep(parsed);
                        if (deepToken) {
                                return deepToken;
                        }
                } catch {
                        // Keep fallback logic below for non-JSON payloads.
                }
        }

        const regexCandidates = [trimmed, dequoted];
        for (const candidate of regexCandidates) {
                const regexToken = /"token"\s*:\s*"([^"]+)"/i.exec(candidate);
                if (regexToken?.[1]) {
                        return regexToken[1];
                }
        }

        const sample = dequoted.slice(0, 500).replaceAll(/\s+/g, ' ');
        throw new Error(
                `Token response did not contain a token field. Response sample: ${sample}`,
        );
}

type SetupSession = {
        browser: Browser;
        context: BrowserContext;
        page: Page;
};

async function launchSetupSession(
        proxyServer: string | undefined,
        customUserAgent: string,
        proxyUsername?: string,
        proxyPassword?: string,
): Promise<SetupSession> {
        const launchOptions = {
                channel: 'chrome' as const,
                headless: false,
        };
        const proxyConfig = proxyServer
                ? {
                        server: proxyServer,
                        username: proxyUsername,
                        password: proxyPassword,
                  }
                : undefined;
        const contextOptions = {
                ignoreHTTPSErrors: true,
                proxy: proxyConfig,
                userAgent: customUserAgent,
        };

        const browser = await chromium.launch(launchOptions);
        const context = await browser.newContext(contextOptions);
        const page = await context.newPage();
        return { browser, context, page };
}

export default async function globalSetup(): Promise<void> {
        const ibpsApplicationUrl = requireEnv('IBPS_APPLICATION');
        const aceIdBaseUrl = requireEnv('IBPS_APPLICATION_ACE_ID');
        const ibpsUser = resolveIbpsTokenUser(requireEnv('IBPS_USER'));
        const tokenBaseUrl = requireEnv('IBPS_APPLICATION_TOKEN');
        const proxyServer =
                optionalEnv('IBPS_PROXY_SERVER')
                ?? optionalEnv('HTTPS_PROXY')
                ?? optionalEnv('HTTP_PROXY');
        const proxyUsername = optionalEnv('IBPS_PROXY_USERNAME');
        const proxyPassword = optionalEnv('IBPS_PROXY_PASSWORD');
        const customUserAgent = optionalEnv('IBPS_USER_AGENT') ?? 'Selenium';
        const navigationTimeoutMs = Number(optionalEnv('IBPS_NAV_TIMEOUT_MS') ?? '90000');

        const { browser, context, page } = await launchSetupSession(proxyServer, customUserAgent, proxyUsername, proxyPassword);
        page.setDefaultNavigationTimeout(navigationTimeoutMs);

        try {
                // Match Selenium behavior: warm up base IBPS app before requesting token.
                try {
                        await page.goto(ibpsApplicationUrl, {
                                waitUntil: 'domcontentloaded',
                                timeout: navigationTimeoutMs,
                        });
                } catch (error) {
                        // Continue to token endpoint if base app warm-up hangs in this environment.
                        const message = error instanceof Error ? error.message : String(error);
                        console.warn(`Warm-up navigation failed, continuing with token flow: ${message}`);
                }

                const firstUrl = `${aceIdBaseUrl}${ibpsUser}`;
                const tokenResponse = await page.goto(firstUrl, {
                        waitUntil: 'domcontentloaded',
                        timeout: navigationTimeoutMs,
                });

                const tokenJson = tokenResponse
                        ? await tokenResponse.text()
                        : await page.locator('pre').first().innerText();
                const token = extractToken(tokenJson);

                const ibpsUrlWithToken = `${tokenBaseUrl}${token}`;
                await page.goto(ibpsUrlWithToken, { waitUntil: 'networkidle', timeout: navigationTimeoutMs });
                await page.goto(ibpsUrlWithToken, { waitUntil: 'networkidle', timeout: navigationTimeoutMs });

                await context.storageState({ path: STORAGE_STATE_PATH });
        } finally {
                await context.close();
                await browser.close();
        }
}