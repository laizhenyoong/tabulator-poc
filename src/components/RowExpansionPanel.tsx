import React from 'react';
import styled from 'styled-components';
import { PackageRecord } from '../types';

const ExpansionContainer = styled.div`
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 16px;
  margin: 0;
`;

const ExpansionContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  max-width: 100%;
`;

const DetailSection = styled.div`
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 12px;
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: #495057;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const DetailValue = styled.div`
  color: #212529;
  font-size: 14px;
  word-break: break-word;
`;

const PackageListContainer = styled.div`
  grid-column: 1 / -1;
`;

const PackageItem = styled.div`
  background-color: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 4px;
  padding: 8px 12px;
  margin: 4px 8px 4px 0;
  display: inline-block;
  font-size: 13px;
  color: #1976d2;
`;

const ExpansionIndicator = styled.button<{ expanded: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 2px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &::before {
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    transition: transform 0.2s ease;
    
    ${props => props.expanded ? `
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 6px solid #6c757d;
      transform: rotate(0deg);
    ` : `
      border-top: 4px solid transparent;
      border-bottom: 4px solid transparent;
      border-left: 6px solid #6c757d;
      transform: rotate(0deg);
    `}
  }
`;

interface RowExpansionPanelProps {
  rowData: PackageRecord;
  expanded: boolean;
  onToggle: () => void;
  customContent?: React.ReactNode;
}

/**
 * RowExpansionPanel Component
 * 
 * Provides expandable row functionality with detailed information display
 * Supports custom content rendering and maintains independent expansion states
 */
const RowExpansionPanel: React.FC<RowExpansionPanelProps> = ({
  rowData,
  expanded,
  onToggle,
  customContent
}) => {
  return (
    <>
      {/* Expansion Indicator - This would typically be rendered in the table row */}
      <ExpansionIndicator
        expanded={expanded}
        onClick={onToggle}
        data-testid="expansion-indicator"
        aria-label={expanded ? 'Collapse row' : 'Expand row'}
        title={expanded ? 'Collapse row' : 'Expand row'}
      />
      
      {/* Expanded Content */}
      {expanded && (
        <ExpansionContainer data-testid="expansion-content">
          {customContent ? (
            customContent
          ) : (
            <ExpansionContent>
              <DetailSection>
                <DetailLabel>Package ID</DetailLabel>
                <DetailValue data-testid="detail-package-id">{rowData.packageId}</DetailValue>
              </DetailSection>
              
              <DetailSection>
                <DetailLabel>Priority Level</DetailLabel>
                <DetailValue data-testid="detail-priority">{rowData.priority}</DetailValue>
              </DetailSection>
              
              <DetailSection>
                <DetailLabel>Service Name</DetailLabel>
                <DetailValue data-testid="detail-service-name">{rowData.serviceName}</DetailValue>
              </DetailSection>
              
              <DetailSection>
                <DetailLabel>Process Control ID</DetailLabel>
                <DetailValue data-testid="detail-pcid">{rowData.pcid}</DetailValue>
              </DetailSection>
              
              <DetailSection>
                <DetailLabel>Quota Configuration</DetailLabel>
                <DetailValue data-testid="detail-quota-name">{rowData.quotaName}</DetailValue>
              </DetailSection>
              
              <DetailSection>
                <DetailLabel>User Profile</DetailLabel>
                <DetailValue data-testid="detail-user-profile">{rowData.userProfile}</DetailValue>
              </DetailSection>
              
              <PackageListContainer>
                <DetailSection>
                  <DetailLabel>Package List ({rowData.packageList.length} items)</DetailLabel>
                  <div data-testid="detail-package-list">
                    {rowData.packageList.map((pkg, index) => (
                      <PackageItem key={index} data-testid={`package-item-${index}`}>
                        {pkg}
                      </PackageItem>
                    ))}
                  </div>
                </DetailSection>
              </PackageListContainer>
            </ExpansionContent>
          )}
        </ExpansionContainer>
      )}
    </>
  );
};

export default RowExpansionPanel;