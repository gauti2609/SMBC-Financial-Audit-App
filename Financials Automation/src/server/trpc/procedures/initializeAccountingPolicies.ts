import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { TRPCError } from "@trpc/server";

export const initializeAccountingPolicies = baseProcedure
  .input(z.object({
    companyId: z.string(),
  }))
  .mutation(async ({ input }) => {
  try {
    // Check if policies already exist for this company
    const existingPolicies = await db.accountingPolicyContent.findMany({
      where: { companyId: input.companyId },
    });
    
    if (existingPolicies.length > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Accounting policies already exist for this company. Please delete existing policies first if you want to reinitialize.'
      });
    }

    const defaultPolicies = [
      {
        noteRef: "A.2.1",
        title: "Revenue Recognition (AS 9)",
        content: `Revenue is recognized when it is probable that the economic benefits will flow to the Company and the revenue can be reliably measured. Revenue from sale of goods is recognized when the significant risks and rewards of ownership of the goods have passed to the buyer, usually on dispatch of the goods.

Service revenue is recognized on proportionate completion basis as the services are performed. Interest income is recognized on a time proportion basis taking into account the amount outstanding and the applicable interest rate.

Dividend income is recognized when the right to receive dividend is established.`,
        isDefault: true
      },
      {
        noteRef: "A.2.2", 
        title: "Property, Plant and Equipment (AS 10)",
        content: `Property, Plant and Equipment are stated at cost, net of accumulated depreciation and accumulated impairment losses, if any. The cost comprises purchase price, borrowing costs if capitalization criteria are met and directly attributable cost of bringing the asset to its working condition for the intended use.

Subsequent expenditure related to an item of fixed asset is added to its book value only if it increases the future benefits from the existing asset beyond its previously assessed standard of performance. All other expenses on existing fixed assets, including day-to-day repair and maintenance expenditure and cost of replacing parts, are charged to the statement of profit and loss for the period during which such expenses are incurred.

Gains and losses on disposal of fixed assets are determined by comparing proceeds with carrying amount. These are included in profit or loss within other gains/(losses).`,
        isDefault: true
      },
      {
        noteRef: "A.2.3",
        title: "Intangible Assets (AS 26)", 
        content: `Intangible assets acquired separately are measured on initial recognition at cost. Following initial recognition, intangible assets are carried at cost less accumulated amortization and accumulated impairment losses, if any.

The useful lives of intangible assets are assessed as either finite or indefinite. Intangible assets with finite lives are amortized over the useful economic life and assessed for impairment whenever there is an indication that the intangible asset may be impaired.

Computer software is amortized over a period of 3-5 years on straight line basis.`,
        isDefault: true
      },
      {
        noteRef: "A.2.4",
        title: "Impairment of Assets (AS 28)",
        content: `The Company assesses at each reporting date whether there is an indication that an asset may be impaired. If any indication exists, or when annual impairment testing for an asset is required, the Company estimates the asset's recoverable amount.

An asset's recoverable amount is the higher of an asset's or cash-generating unit's (CGU) fair value less costs of disposal and its value in use. Recoverable amount is determined for an individual asset, unless the asset does not generate cash inflows that are largely independent of those from other assets or groups of assets.

When the carrying amount of an asset or CGU exceeds its recoverable amount, the asset is considered impaired and is written down to its recoverable amount.`,
        isDefault: true
      },
      {
        noteRef: "A.2.5",
        title: "Inventories (AS 2)",
        content: `Inventories are valued at the lower of cost and net realizable value. Cost of inventories comprises all costs of purchase, costs of conversion and other costs incurred in bringing the inventories to their present location and condition.

Raw materials and stores & spares are valued at cost on weighted average basis. Work-in-progress and finished goods are valued at cost including direct materials, direct labor and a proportion of manufacturing overheads or net realizable value, whichever is lower.

Net realizable value is the estimated selling price in the ordinary course of business, less estimated costs of completion and estimated costs necessary to make the sale.`,
        isDefault: true
      },
      {
        noteRef: "A.2.6",
        title: "Investments (AS 13)",
        content: `Investments that are readily realizable and intended to be held for not more than a year are classified as current investments. All other investments are classified as long-term investments.

Current investments are carried at lower of cost and fair value determined on an individual investment basis. Long-term investments are carried at cost. However, provision for diminution in value is made to recognize a decline other than temporary in the value of the investments.`,
        isDefault: true
      },
      {
        noteRef: "A.2.7",
        title: "Foreign Currency Transactions (AS 11)",
        content: `Foreign currency transactions are recorded at the exchange rates prevailing on the date of the transaction. Foreign currency monetary items are translated at the closing rate. Non-monetary items which are carried in terms of historical cost denominated in a foreign currency are reported using the exchange rate at the date of the transaction.

Exchange differences arising on the settlement of monetary items or on reporting company's monetary items at rates different from those at which they were initially recorded during the year, or reported in previous financial statements, are recognized as income or as expenses in the year in which they arise.`,
        isDefault: true
      },
      {
        noteRef: "A.2.8",
        title: "Employee Benefits (AS 15)",
        content: `Employee benefits include provident fund, employee state insurance scheme, gratuity and compensated absences.

Defined Contribution Plans: The Company's contribution to provident fund and employee state insurance scheme are considered as defined contribution plans and are charged as an expense based on the amount of contribution required to be made.

Defined Benefit Plans: For defined benefit plans such as gratuity, the cost of providing benefits is determined using the projected unit credit method, with actuarial valuations being carried out at each balance sheet date. Actuarial gains and losses are recognized in the statement of profit and loss in the period in which they occur.

Short-term employee benefits: The undiscounted amount of short-term employee benefits expected to be paid in exchange for the services rendered by employees are recognized during the year when the employees render the service.`,
        isDefault: true
      },
      {
        noteRef: "A.2.9",
        title: "Borrowing Costs (AS 16)",
        content: `Borrowing costs directly attributable to the acquisition, construction or production of an asset that necessarily takes a substantial period of time to get ready for its intended use or sale are capitalized as part of the cost of the respective asset. All other borrowing costs are expensed in the period they occur.

Borrowing costs consist of interest and other costs that an entity incurs in connection with the borrowing of funds. Borrowing cost also includes exchange differences to the extent regarded as an adjustment to the borrowing costs.`,
        isDefault: true
      },
      {
        noteRef: "A.2.10",
        title: "Provisions, Contingent Liabilities and Contingent Assets (AS 29)",
        content: `Provisions are recognized when the Company has a present obligation (legal or constructive) as a result of a past event, it is probable that an outflow of resources embodying economic benefits will be required to settle the obligation and a reliable estimate can be made of the amount of the obligation.

Contingent liabilities are disclosed when there is a possible obligation arising from past events, the existence of which will be confirmed only by the occurrence or non-occurrence of one or more uncertain future events not wholly within the control of the Company or a present obligation that arises from past events where it is either not probable that an outflow of resources will be required to settle or a reliable estimate of the amount cannot be made.`,
        isDefault: true
      },
      {
        noteRef: "A.2.11",
        title: "Income Taxes (AS 22)",
        content: `Tax expense comprises current and deferred tax. Current income tax is measured at the amount expected to be paid to the tax authorities in accordance with the Income Tax Act, 1961.

Deferred income taxes reflect the impact of timing differences between taxable income and accounting income originating during the current year and reversal of timing differences for the earlier years. Deferred tax is measured using the tax rates and the tax laws enacted or substantively enacted at the balance sheet date.

Deferred tax liabilities are recognized for all timing differences. Deferred tax assets are recognized for deductible timing differences only to the extent that there is reasonable certainty that sufficient future taxable income will be available against which such deferred tax assets can be realized.`,
        isDefault: true
      },
      {
        noteRef: "A.2.12",
        title: "Government Grants (AS 12)",
        content: `Government grants are recognized where there is reasonable assurance that the grant will be received and all attached conditions will be complied with. When the grant relates to an expense item, it is recognized as income on a systematic basis over the periods that the related costs, for which it is intended to compensate, are expensed.

When the grant relates to an asset, it is recognized as income in equal amounts over the expected useful life of the related asset. When the Company receives grants of non-monetary assets, the asset and the grant are recorded at nominal amounts and released to profit or loss over the expected useful life of the asset, based on the pattern of consumption of the benefits of the underlying asset by equal annual installments.`,
        isDefault: true
      }
    ];

    // Create all default policies for the specific company
    const createdPolicies = [];
    for (const policy of defaultPolicies) {
      const created = await db.accountingPolicyContent.create({
        data: {
          ...policy,
          companyId: input.companyId,
        }
      });
      createdPolicies.push(created);
    }

    return {
      success: true,
      count: createdPolicies.length,
      policies: createdPolicies
    };

  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to initialize accounting policies: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});
