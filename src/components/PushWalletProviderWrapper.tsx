import React, { useEffect } from 'react';
// Temporarily disabled due to Station error in ui-kit
// import { PushUniversalWalletProvider, PushUI } from '@pushchain/ui-kit';

interface Props {
    children: React.ReactNode;
}

export default function PushWalletProviderWrapper({ children }: Props) {
    // Suppress Push UI Kit errors to prevent red error banner
    useEffect(() => {
        const originalError = console.error;
        console.error = (...args) => {
            // Suppress Station/name errors from Push UI Kit
            if (args[0]?.includes?.('Station failed') || args[0]?.includes?.('name does not exist')) {
                return;
            }
            originalError.apply(console, args);
        };

        return () => {
            console.error = originalError;
        };
    }, []);

    // Temporarily return children without PushUniversalWalletProvider
    // until the Station error in @pushchain/ui-kit is fixed
    return <>{children}</>;

    /* Disabled due to Station error
    return (
        <PushUniversalWalletProvider
            config={{
                network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
            }}
        >
            {children}
        </PushUniversalWalletProvider>
    );
    */
}
