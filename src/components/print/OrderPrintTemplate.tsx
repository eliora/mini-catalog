/**
 * OrderPrintTemplate Component
 * 
 * Dedicated print template for orders/invoices
 * Uses inline styles for reliable printing across browsers
 * Reusable in OrderSuccessView and Admin panel
 */

'use client';

import React, { forwardRef } from 'react';
import { useCompany } from '@/context/CompanyContext';

// Order item interface for print
interface PrintOrderItem {
  ref: string;
  product_name: string;
  product_name_2?: string;
  size?: string;
  unit_price: number;
  quantity: number;
}

interface OrderPrintTemplateProps {
  orderId: string;
  customerName: string;
  orderDate: string;
  items: PrintOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  formatCurrency: (amount: number) => string;
  className?: string;
}

const OrderPrintTemplate = forwardRef<HTMLDivElement, OrderPrintTemplateProps>(({
  orderId,
  customerName,
  orderDate,
  items,
  subtotal,
  tax,
  total,
  formatCurrency,
  className = ''
}, ref) => {
  const { settings } = useCompany();
  
  // Get company details from settings
  const companyName = settings?.company_name || 'חברת י.ד.א';
  const companyPhone = settings?.contact_phone || '';
  const companyEmail = settings?.contact_email || '';
  const companyAddress = settings?.address || '';

  // Format order number
  const formatOrderNumber = (id: string): string => {
    return `#${id.substring(0, 8).toUpperCase()}`;
  };

  const printStyles: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    lineHeight: '1.4',
    color: '#000',
    direction: 'rtl',
    backgroundColor: 'white',
    padding: '0',
    margin: '0',
    width: '100%',
    minHeight: '100%'
  };

  return (
    <div ref={ref} className={className} style={printStyles}>
      {/* Company Header */}
      <div style={{ 
        borderBottom: '2px solid #333', 
        paddingBottom: '15px', 
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            {companyName}
          </h1>
          {companyAddress && (
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>
              {companyAddress}
            </div>
          )}
          {companyPhone && (
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '3px' }}>
              טלפון: {companyPhone}
            </div>
          )}
          {companyEmail && (
            <div style={{ fontSize: '11px', color: '#666' }}>
              דוא&quot;ל: {companyEmail}
            </div>
          )}
        </div>
        
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '20px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            הזמנה
          </h2>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
            {formatOrderNumber(orderId)}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            {orderDate}
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div style={{ 
        marginBottom: '25px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>
          פרטי לקוח:
        </div>
        <div style={{ fontSize: '13px' }}>
          {customerName}
        </div>
      </div>

      {/* Items Table */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          marginBottom: '10px',
          color: '#333'
        }}>
          פריטים שהוזמנו:
        </div>
        
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          border: '1px solid #333'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ 
                border: '1px solid #333', 
                padding: '10px 8px', 
                textAlign: 'right',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                מק&quot;ט
              </th>
              <th style={{ 
                border: '1px solid #333', 
                padding: '10px 8px', 
                textAlign: 'right',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                תיאור מוצר
              </th>
              <th style={{ 
                border: '1px solid #333', 
                padding: '10px 8px', 
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                כמות
              </th>
              <th style={{ 
                border: '1px solid #333', 
                padding: '10px 8px', 
                textAlign: 'left',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                מחיר יחידה
              </th>
              <th style={{ 
                border: '1px solid #333', 
                padding: '10px 8px', 
                textAlign: 'left',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                סה&quot;כ
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ 
                backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
              }}>
                <td style={{ 
                  border: '1px solid #333', 
                  padding: '8px', 
                  fontFamily: 'monospace',
                  fontSize: '11px'
                }}>
                  {item.ref}
                </td>
                <td style={{ 
                  border: '1px solid #333', 
                  padding: '8px',
                  fontSize: '11px'
                }}>
                  <div style={{ fontWeight: 'bold' }}>
                    {item.product_name}
                  </div>
                  {item.product_name_2 && (
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#666',
                      marginTop: '2px'
                    }}>
                      {item.product_name_2}
                    </div>
                  )}
                  {item.size && (
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#666',
                      marginTop: '2px'
                    }}>
                      גודל: {item.size}
                    </div>
                  )}
                </td>
                <td style={{ 
                  border: '1px solid #333', 
                  padding: '8px', 
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {item.quantity}
                </td>
                <td style={{ 
                  border: '1px solid #333', 
                  padding: '8px', 
                  textAlign: 'left',
                  fontSize: '11px'
                }}>
                  {formatCurrency(item.unit_price)}
                </td>
                <td style={{ 
                  border: '1px solid #333', 
                  padding: '8px', 
                  textAlign: 'left',
                  fontWeight: 'bold',
                  fontSize: '11px'
                }}>
                  {formatCurrency(item.unit_price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{ 
        marginLeft: 'auto', 
        width: '350px',
        border: '1px solid #333',
        marginBottom: '25px'
      }}>
        <div style={{ 
          backgroundColor: '#333', 
          color: 'white', 
          padding: '10px', 
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          סיכום הזמנה
        </div>
        <div style={{ padding: '15px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '8px',
            fontSize: '12px'
          }}>
            <span>סכום ביניים:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '8px',
            fontSize: '12px'
          }}>
            <span>מע&quot;מ:</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div style={{ 
            borderTop: '1px solid #333', 
            paddingTop: '8px', 
            marginTop: '8px',
            display: 'flex', 
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            <span>סה&quot;כ לתשלום:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '30px', 
        paddingTop: '15px', 
        borderTop: '1px solid #ddd',
        textAlign: 'center',
        fontSize: '10px',
        color: '#666'
      }}>
        <div style={{ marginBottom: '8px' }}>
          תודה על ההזמנה! נציגנו יצור איתך קשר בקרוב לאישור ההזמנה.
        </div>
        <div style={{ marginBottom: '8px' }}>
          הזמנה זו אינה מהווה חשבונית מס. חשבונית מס תישלח לאחר משלוח המוצרים.
        </div>
        <div>
          הודפס: {new Date().toLocaleString('he-IL')}
        </div>
      </div>
    </div>
  );
});

OrderPrintTemplate.displayName = 'OrderPrintTemplate';

export default OrderPrintTemplate;
