/**
 * usePrint Hook
 * 
 * Reusable hook for printing functionality using react-to-print
 * Provides consistent printing behavior across the application
 */

'use client';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface UsePrintOptions {
  documentTitle?: string;
  onBeforePrint?: () => Promise<void> | void;
  onAfterPrint?: () => Promise<void> | void;
}

interface UsePrintReturn {
  printRef: React.RefObject<HTMLDivElement | null>;
  handlePrint: () => void;
  isPrinting: boolean;
}

export const usePrint = (options: UsePrintOptions = {}): UsePrintReturn => {
  const {
    documentTitle = 'הזמנה',
    onBeforePrint,
    onAfterPrint
  } = options;

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle,
    onBeforePrint: onBeforePrint ? () => Promise.resolve(onBeforePrint()) : undefined,
    onAfterPrint: onAfterPrint ? () => Promise.resolve(onAfterPrint()) : undefined,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
          font-family: 'Arial', sans-serif;
          direction: rtl;
        }
        
        * {
          box-sizing: border-box;
        }
      }
    `
  });

  return {
    printRef,
    handlePrint,
    isPrinting: false // react-to-print handles this internally
  };
};

export default usePrint;
