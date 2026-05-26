# Agent Skills

This file configures agent skills for engineering workflows. Engineering skills use these configurations to understand where issues live, how to triage them, and where to find domain documentation.

## Agent skills

### Issue tracker

Issues and PRDs live in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one CONTEXT.md + docs/adr/ at repo root. See `docs/agents/domain.md`.

### Clerk Docs

See `https://clerk.com/docs/llms.txt`

# MetaMask

**Before you start**

- [A Clerk application is required.](https://clerk.com/docs/getting-started/quickstart/setup-clerk.md)

Enabling [MetaMask](https://metamask.io/) as a Web3 provider allows your users to sign in and  up to your Clerk application with their MetaMask wallet.

> MetaMask authentication is not supported when using the **Clerk Chrome Extension SDK**, as it cannot load third-party code per Chrome Web Store policies.

## Enable MetaMask as a Web3 provider

1. In the Clerk Dashboard, navigate to the [**Web3**](https://dashboard.clerk.com/~/user-authentication/web3) page.
2. From the list of web3 providers, enable **MetaMask**.
3. Download the [Metamask plugin](https://metamask.io/download/) and install it on your browser to ensure a seamless login flow.

## Test authentication

The simplest way to test authentication is to visit your Clerk application's [Account Portal](https://clerk.com/docs/guides/account-portal/overview.md), which is available for all Clerk applications out-of-the-box.

1. In the Clerk Dashboard, navigate to the [**Account Portal**](https://dashboard.clerk.com/~/account-portal) page.
2. Next to the **Sign-in** URL, select **Visit**. The URL should resemble:
   - **For development** – `https://your-domain.accounts.dev/sign-in`
   - **For production** – `https://accounts.your-domain.com/sign-in`
3. On the sign-in page, you should see **MetaMask** as an option. Use it to sign in.

## Collect additional user information during sign-up (optional)

Web3 applications typically use a hexadecimal wallet address to identify users, which offers a high level of privacy. However, when bridging the gap between Web3 and Web2, it's often necessary to gather human-readable information about the user, such as their email address, phone number, or a username.

To collect additional information about your user during sign-up:

1. In the Clerk Dashboard, navigate to the [**User & authentication**](https://dashboard.clerk.com/~/user-authentication/user-and-authentication) page.
2. On this page, enable the attributes you want to collect from your user during sign-up.

## Connect MetaMask to existing account

Users can connect their MetaMask Wallet to their account at any time through their user profile page. You can configure your application to use the [Account Portal user profile page](https://clerk.com/docs/guides/account-portal/overview.md#user-profile) or the prebuilt [<UserProfile />](https://clerk.com/docs/reference/components/user/user-profile.md) component.
