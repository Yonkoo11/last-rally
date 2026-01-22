import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from './WalletConnect.module.css';

interface WalletConnectProps {
  compact?: boolean;
}

export function WalletConnect({ compact = false }: WalletConnectProps) {
  return (
    <div className={styles.container}>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      className={`${styles.connectButton} ${compact ? styles.compact : ''}`}
                    >
                      <span className={styles.icon}>⛓️</span>
                      {!compact && <span>Connect Wallet</span>}
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      className={`${styles.wrongNetwork} ${compact ? styles.compact : ''}`}
                    >
                      Wrong Network
                    </button>
                  );
                }

                return (
                  <div className={styles.connected}>
                    <button
                      onClick={openChainModal}
                      className={styles.chainButton}
                      title={chain.name}
                    >
                      {chain.hasIcon && chain.iconUrl && (
                        <img
                          src={chain.iconUrl}
                          alt={chain.name}
                          className={styles.chainIcon}
                        />
                      )}
                    </button>

                    <button
                      onClick={openAccountModal}
                      className={`${styles.accountButton} ${compact ? styles.compact : ''}`}
                    >
                      <span className={styles.address}>
                        {account.displayName}
                      </span>
                      {account.displayBalance && !compact && (
                        <span className={styles.balance}>
                          {account.displayBalance}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}
