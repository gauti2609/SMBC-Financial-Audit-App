import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

const trialBalanceSchema = z.object({
  ledgerName: z.string().min(1, 'Ledger name is required'),
  openingBalanceCY: z.number().default(0),
  debitCY: z.number().default(0),
  creditCY: z.number().default(0),
  closingBalanceCY: z.number().default(0),
  closingBalancePY: z.number().default(0),
  type: z.enum(['BS', 'PL']),
  majorHead: z.string().optional(),
  minorHead: z.string().optional(),
  grouping: z.string().optional(),
});

type TrialBalanceEntry = z.infer<typeof trialBalanceSchema>;

interface EditEntryFormProps {
  entry: any;
  onSubmit: (data: TrialBalanceEntry) => Promise<void>;
  onCancel: () => void;
  majorHeads: Array<{ id: string; name: string }>;
  minorHeads: Array<{ id: string; name: string }>;
  groupings: Array<{ id: string; name: string }>;
  isLoading: boolean;
}

export default function EditEntryForm({
  entry,
  onSubmit,
  onCancel,
  majorHeads,
  minorHeads,
  groupings,
  isLoading,
}: EditEntryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TrialBalanceEntry>({
    resolver: zodResolver(trialBalanceSchema),
    defaultValues: {
      ledgerName: entry.ledgerName || '',
      openingBalanceCY: Number(entry.openingBalanceCY) || 0,
      debitCY: Number(entry.debitCY) || 0,
      creditCY: Number(entry.creditCY) || 0,
      closingBalanceCY: Number(entry.closingBalanceCY) || 0,
      closingBalancePY: Number(entry.closingBalancePY) || 0,
      type: entry.type || 'BS',
      majorHead: entry.majorHead || '',
      minorHead: entry.minorHead || '',
      grouping: entry.grouping || '',
    },
  });

  // Update form when entry changes
  useEffect(() => {
    reset({
      ledgerName: entry.ledgerName || '',
      openingBalanceCY: Number(entry.openingBalanceCY) || 0,
      debitCY: Number(entry.debitCY) || 0,
      creditCY: Number(entry.creditCY) || 0,
      closingBalanceCY: Number(entry.closingBalanceCY) || 0,
      closingBalancePY: Number(entry.closingBalancePY) || 0,
      type: entry.type || 'BS',
      majorHead: entry.majorHead || '',
      minorHead: entry.minorHead || '',
      grouping: entry.grouping || '',
    });
  }, [entry, reset]);

  // Watch for changes to calculate closing balance
  const openingBalance = watch('openingBalanceCY');
  const debit = watch('debitCY');
  const credit = watch('creditCY');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ledger Name *
          </label>
          <input
            {...register('ledgerName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter ledger name"
          />
          {errors.ledgerName && (
            <p className="text-red-500 text-sm mt-1">{errors.ledgerName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select type</option>
            <option value="BS">Balance Sheet</option>
            <option value="PL">P&L Statement</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Major Head
          </label>
          <select
            {...register('majorHead')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select major head</option>
            {majorHeads.map((head) => (
              <option key={head.id} value={head.name}>
                {head.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minor Head
          </label>
          <select
            {...register('minorHead')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select minor head</option>
            {minorHeads.map((head) => (
              <option key={head.id} value={head.name}>
                {head.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grouping
          </label>
          <select
            {...register('grouping')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select grouping</option>
            {groupings.map((grouping) => (
              <option key={grouping.id} value={grouping.name}>
                {grouping.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opening Balance (CY)
          </label>
          <input
            {...register('openingBalanceCY', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Debit (CY)
          </label>
          <input
            {...register('debitCY', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credit (CY)
          </label>
          <input
            {...register('creditCY', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Closing Balance (PY)
          </label>
          <input
            {...register('closingBalancePY', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-gray-600">
          Calculated Closing Balance (CY): <strong>₹{formatCurrency((openingBalance || 0) + (debit || 0) - (credit || 0))}</strong>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update Entry'}
          </button>
        </div>
      </div>
    </form>
  );
}
