import { createFileRoute } from "@tanstack/react-router";
import Layout from "~/components/Layout";
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export const Route = createFileRoute("/help/")({
  component: Help,
});

function Help() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpenIcon,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Welcome to Financial Automation Tool</h3>
            <p className="text-gray-700 mb-4">
              This tool helps you generate Schedule III compliant financial statements automatically from your trial balance data. 
              Follow this step-by-step guide to get started.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Quick Setup Process</h4>
                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                  <li>Configure your entity details in Common Control</li>
                  <li>Upload your trial balance data</li>
                  <li>Select required notes to accounts</li>
                  <li>Generate financial statements</li>
                </ol>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">System Requirements</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
              <li>Internet connection for data processing</li>
              <li>Excel files (.xlsx) or CSV files for data upload</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'common-control',
      title: 'Common Control Settings',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Entity Configuration</h3>
            <p className="text-gray-700 mb-4">
              The Common Control page is where you configure your entity details and financial statement preferences.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Entity Information</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li><strong>Entity Name:</strong> Your company's legal name as it appears on official documents</li>
                <li><strong>Address:</strong> Complete registered office address</li>
                <li><strong>CIN Number:</strong> Corporate Identification Number (if applicable)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Financial Year</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li><strong>Start Date:</strong> Beginning of your financial year (e.g., April 1, 2023)</li>
                <li><strong>End Date:</strong> End of your financial year (e.g., March 31, 2024)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Display Preferences</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li><strong>Currency:</strong> INR, USD, or EUR</li>
                <li><strong>Units:</strong> Actual, Thousands, Millions, or Crores</li>
                <li><strong>Numbers Format:</strong> How numbers are displayed in statements</li>
                <li><strong>Negative Display:</strong> Brackets (1,000), Red Color, or Minus Sign -1,000</li>
                <li><strong>Font Settings:</strong> Default font family and size for statements</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Master Data Management</h4>
                <p className="text-sm text-green-800">
                  You can also manage master lists for Major Heads, Minor Heads, and Groupings on this page. 
                  These will be used for categorizing your trial balance entries.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'trial-balance',
      title: 'Trial Balance Management',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Upload Trial Balance Data</h3>
            <p className="text-gray-700 mb-4">
              The trial balance is the foundation of your financial statements. You can upload data via Excel file or enter manually.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Required Fields</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li><strong>Ledger Name:</strong> Name of the account</li>
                <li><strong>Type:</strong> BS (Balance Sheet) or PL (Profit & Loss)</li>
                <li><strong>Opening Balance (CY):</strong> Opening balance for current year</li>
                <li><strong>Debit (CY):</strong> Total debit transactions</li>
                <li><strong>Credit (CY):</strong> Total credit transactions</li>
                <li><strong>Closing Balance (PY):</strong> Previous year closing balance</li>
                <li><strong>Major Head:</strong> Primary classification (optional)</li>
                <li><strong>Grouping:</strong> Sub-classification (optional)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Excel Upload Format</h4>
              <p className="text-gray-700 mb-2">Your Excel file should have these columns:</p>
              <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                Ledger Name | Type | Opening Balance CY | Debit CY | Credit CY | Closing Balance PY | Major Head | Grouping
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Important Notes</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Closing Balance (CY) is automatically calculated as: Opening + Debit - Credit</li>
                  <li>• Ensure all monetary values are in the same units as configured in Common Control</li>
                  <li>• Use consistent naming for Major Heads and Groupings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'notes-selection',
      title: 'Notes to Accounts Selection',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Required Notes</h3>
            <p className="text-gray-700 mb-4">
              Choose which notes to include in your financial statements based on AS requirements and Schedule III compliance.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Note Categories</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li><strong>A-Series:</strong> Accounting policies and general notes (mandatory)</li>
                <li><strong>B-Series:</strong> Equity and liabilities notes</li>
                <li><strong>C-Series:</strong> Assets notes</li>
                <li><strong>D-Series:</strong> Profit and Loss notes</li>
                <li><strong>E-Series:</strong> AS-specific disclosures</li>
                <li><strong>F-Series:</strong> Schedule III (2021) additional disclosures</li>
                <li><strong>G-Series:</strong> Other statutory disclosures</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Selection Process</h4>
              <ol className="list-decimal list-inside text-gray-700 space-y-1 ml-4">
                <li>Review system recommendations (marked with green indicators)</li>
                <li>Toggle user selection for additional notes as needed</li>
                <li>Click "Save Selections" to confirm your choices</li>
                <li>Use "Auto Number" to assign sequential note numbers</li>
              </ol>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Auto-Numbering</h4>
                <p className="text-sm text-blue-800">
                  The system automatically assigns note numbers based on your selections. 
                  A-series notes retain their reference numbers, while others get sequential numbers.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'financial-statements',
      title: 'Financial Statements',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Generated Statements</h3>
            <p className="text-gray-700 mb-4">
              Once your data is uploaded and notes selected, you can generate Schedule III compliant financial statements.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Available Statements</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Balance Sheet:</strong> Shows assets, liabilities, and equity as per Schedule III format
                </li>
                <li>
                  <strong>Profit & Loss Statement:</strong> Revenue, expenses, and net profit/loss for the period
                </li>
                <li>
                  <strong>Cash Flow Statement:</strong> Cash flows from operating, investing, and financing activities (indirect method)
                </li>
                <li>
                  <strong>Ratio Analysis:</strong> Key financial ratios with variance explanations ({'>'}25% variance)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Statement Features</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Professional formatting with entity header and signature sections</li>
                <li>Note number references linked to your selections</li>
                <li>Proper currency formatting as per your preferences</li>
                <li>Export options: Print, Share, Export to Excel</li>
                <li>Summary statistics and key metrics</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Schedule III Compliance</h4>
                <p className="text-sm text-green-800">
                  All generated statements follow the prescribed formats under Schedule III of the Companies Act, 2013, 
                  including the latest amendments from 2021.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'related-parties',
      title: 'Related Party Transactions',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">AS 18 Compliance</h3>
            <p className="text-gray-700 mb-4">
              Manage related party transactions as required by AS 18 and Schedule III disclosure requirements.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li><strong>Related Party Name:</strong> Name of the related entity/person</li>
                <li><strong>Relationship:</strong> Nature of relationship (Holding Company, KMP, etc.)</li>
                <li><strong>Transaction Type:</strong> Type of transaction (Purchase, Sale, Remuneration, etc.)</li>
                <li><strong>Amounts:</strong> Current year and previous year transaction amounts</li>
                <li><strong>Outstanding Balances:</strong> Amounts outstanding at year-end</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Predefined Categories</h4>
              <p className="text-gray-700 mb-2">The system includes predefined options for:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-800 mb-1">Relationships:</h5>
                  <ul className="text-sm text-gray-600 space-y-0.5">
                    <li>• Holding Company</li>
                    <li>• Subsidiary</li>
                    <li>• Associate Company</li>
                    <li>• Key Management Personnel</li>
                    <li>• Director</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800 mb-1">Transaction Types:</h5>
                  <ul className="text-sm text-gray-600 space-y-0.5">
                    <li>• Purchase/Sale of goods</li>
                    <li>• Purchase/Sale of services</li>
                    <li>• Remuneration</li>
                    <li>• Interest paid/received</li>
                    <li>• Loans given/taken</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Issues and Solutions</h3>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Trial Balance Upload Fails</h4>
              <p className="text-gray-700 mb-2"><strong>Possible Causes:</strong></p>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4 mb-3">
                <li>Excel file format is not supported (.xlsx required)</li>
                <li>Missing required columns (Ledger Name, Type)</li>
                <li>Invalid data types (text in number fields)</li>
              </ul>
              <p className="text-gray-700"><strong>Solution:</strong> Check file format and ensure all required fields are present with correct data types.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Financial Statements Show "No Data Available"</h4>
              <p className="text-gray-700 mb-2"><strong>Possible Causes:</strong></p>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4 mb-3">
                <li>No trial balance data uploaded</li>
                <li>All trial balance entries have zero amounts</li>
                <li>Incorrect Type classification (BS vs PL)</li>
              </ul>
              <p className="text-gray-700"><strong>Solution:</strong> Upload trial balance data and ensure proper Type classification.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Note Numbers Not Appearing</h4>
              <p className="text-gray-700 mb-2"><strong>Possible Causes:</strong></p>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4 mb-3">
                <li>Notes not selected in Notes Selection page</li>
                <li>Auto-numbering not triggered</li>
              </ul>
              <p className="text-gray-700"><strong>Solution:</strong> Go to Notes Selection, select required notes, and click "Auto Number".</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Ratio Analysis Shows Incorrect Values</h4>
              <p className="text-gray-700 mb-2"><strong>Possible Causes:</strong></p>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4 mb-3">
                <li>Incorrect Major Head mapping</li>
                <li>Wrong Type classification in trial balance</li>
                <li>Missing previous year data</li>
              </ul>
              <p className="text-gray-700"><strong>Solution:</strong> Review trial balance data and ensure proper Major Head assignments.</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900 mb-1">Still Need Help?</h4>
                <p className="text-sm text-red-800">
                  If you continue to experience issues, please check your data format and ensure all required fields are properly filled. 
                  The system requires clean, well-structured data to generate accurate financial statements.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <QuestionMarkCircleIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                Help & Documentation
              </h1>
              <p className="text-gray-600 mt-2">
                Complete guide to using the Financial Automation Tool
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contents</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                      activeSection === section.id
                        ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {section.icon && <section.icon className="h-4 w-4 mr-2" />}
                    <span className="text-sm">{section.title}</span>
                    <ChevronRightIcon className="h-4 w-4 ml-auto" />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {sections.find(section => section.id === activeSection)?.content}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
