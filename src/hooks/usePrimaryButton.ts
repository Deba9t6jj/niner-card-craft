import { useEffect, useCallback, useRef } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface PrimaryButtonOptions {
  text: string;
  disabled?: boolean;
  hidden?: boolean;
  loading?: boolean;
}

interface UsePrimaryButtonReturn {
  setPrimaryButton: (options: PrimaryButtonOptions, onClick: () => void) => void;
  hidePrimaryButton: () => void;
  showLoading: (text?: string) => void;
  hideLoading: () => void;
}

// Store the current click handler reference
let currentClickHandler: (() => void) | null = null;
let isListenerAttached = false;

export function usePrimaryButton(): UsePrimaryButtonReturn {
  const isMiniAppRef = useRef(false);
  const currentOptionsRef = useRef<PrimaryButtonOptions | null>(null);

  // Check Mini App context on mount
  useEffect(() => {
    const checkContext = async () => {
      try {
        const context = await sdk.context;
        isMiniAppRef.current = !!context;
        
        if (context && !isListenerAttached) {
          // Attach single global listener for primary button clicks
          sdk.on('primaryButtonClicked', () => {
            if (currentClickHandler) {
              currentClickHandler();
            }
          });
          isListenerAttached = true;
          console.log('🔘 Primary button listener attached');
        }
      } catch {
        isMiniAppRef.current = false;
      }
    };
    checkContext();
  }, []);

  // Cleanup on unmount - hide the button
  useEffect(() => {
    return () => {
      if (isMiniAppRef.current) {
        try {
          sdk.actions.setPrimaryButton({ text: '', hidden: true });
        } catch {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  const setPrimaryButton = useCallback((options: PrimaryButtonOptions, onClick: () => void) => {
    if (!isMiniAppRef.current) {
      console.log('ℹ️ Primary button not available outside Mini App');
      return;
    }

    try {
      // Update the click handler
      currentClickHandler = onClick;
      currentOptionsRef.current = options;
      
      // Set the button with options
      sdk.actions.setPrimaryButton({
        text: options.text,
        disabled: options.disabled ?? false,
        hidden: options.hidden ?? false,
      });
      
      console.log('🔘 Primary button set:', options.text);
    } catch (error) {
      console.error('Error setting primary button:', error);
    }
  }, []);

  const hidePrimaryButton = useCallback(() => {
    if (!isMiniAppRef.current) return;

    try {
      currentClickHandler = null;
      currentOptionsRef.current = null;
      sdk.actions.setPrimaryButton({ text: '', hidden: true });
      console.log('🔘 Primary button hidden');
    } catch (error) {
      console.error('Error hiding primary button:', error);
    }
  }, []);

  const showLoading = useCallback((text?: string) => {
    if (!isMiniAppRef.current || !currentOptionsRef.current) return;

    try {
      sdk.actions.setPrimaryButton({
        text: text || currentOptionsRef.current.text,
        disabled: true,
        hidden: false,
      });
    } catch (error) {
      console.error('Error showing loading state:', error);
    }
  }, []);

  const hideLoading = useCallback(() => {
    if (!isMiniAppRef.current || !currentOptionsRef.current) return;

    try {
      sdk.actions.setPrimaryButton({
        ...currentOptionsRef.current,
        disabled: false,
      });
    } catch (error) {
      console.error('Error hiding loading state:', error);
    }
  }, []);

  return {
    setPrimaryButton,
    hidePrimaryButton,
    showLoading,
    hideLoading,
  };
}
