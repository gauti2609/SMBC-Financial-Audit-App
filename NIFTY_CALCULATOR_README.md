# Nifty OHLC Trading Strategy Returns Calculator

A Python script to calculate returns from trading Nifty using daily OHLC (Open, High, Low, Close) data with strict risk management rules.

## Overview

This calculator implements a specific trading strategy:
- **Long trades**: Enter at day's HIGH, exit at day's LOW
- **Short trades**: Enter at day's LOW, exit at day's HIGH
- **Risk Management**: Maximum 2% risk per trade of total capital (configurable)
- **Capital Deployment**: 100% capital can be deployed per trade, but position size is limited by risk rules

## Features

✅ Accepts CSV/TXT files with OHLC data  
✅ Implements strict risk management (2% max risk per trade)  
✅ Calculates position sizes based on risk parameters  
✅ Supports long-only, short-only, or both trade types  
✅ Generates comprehensive trade logs  
✅ Provides detailed performance statistics  
✅ Handles missing/invalid data gracefully  
✅ Calculates risk-adjusted metrics (Sharpe ratio, drawdown, etc.)  

## Requirements

### Python Version
- Python 3.7 or higher

### Dependencies
```bash
pip install pandas numpy
```

Or install from requirements file:
```bash
pip install -r requirements.txt
```

## Input Data Format

The script accepts CSV or TXT files with the following columns:
- **Date**: Trading date (various formats supported: YYYY-MM-DD, DD/MM/YYYY, etc.)
- **Open**: Opening price
- **High**: Highest price of the day
- **Low**: Lowest price of the day
- **Close**: Closing price

### Supported File Formats
- **Separators**: Comma (,), Tab (\t), Semicolon (;), Pipe (|)
- **Date formats**: Automatically detected
- **Column names**: Case-insensitive (e.g., "high", "High", "HIGH" all work)

### Example CSV Format
```csv
Date,Open,High,Low,Close
2000-01-03,1549.80,1563.40,1540.20,1556.50
2000-01-04,1558.20,1572.10,1551.30,1565.80
2000-01-05,1567.00,1580.50,1559.70,1575.20
```

## Usage

### Basic Usage
```bash
python nifty_returns_calculator.py --input nifty_data.csv
```

### With Custom Initial Capital
```bash
python nifty_returns_calculator.py --input nifty_data.csv --capital 500000
```

### With Custom Risk Per Trade (1% instead of default 2%)
```bash
python nifty_returns_calculator.py --input nifty_data.csv --risk 0.01
```

### Save Trade Log and Summary to Files
```bash
python nifty_returns_calculator.py --input nifty_data.csv --output trades.csv --summary summary.txt
```

### Run Only Long Trades
```bash
python nifty_returns_calculator.py --input nifty_data.csv --type long
```

### Run Only Short Trades
```bash
python nifty_returns_calculator.py --input nifty_data.csv --type short
```

### Complete Example with All Options
```bash
python nifty_returns_calculator.py \
    --input nifty_data.csv \
    --capital 1000000 \
    --risk 0.015 \
    --type both \
    --output trade_log.csv \
    --summary performance_summary.txt
```

## Command Line Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input` | `-i` | Input CSV/TXT file with OHLC data (required) | - |
| `--capital` | `-c` | Initial capital amount | 100000 |
| `--risk` | `-r` | Maximum risk per trade (decimal, e.g., 0.02 for 2%) | 0.02 |
| `--type` | `-t` | Trade type: `long`, `short`, or `both` | both |
| `--output` | `-o` | Output CSV file for trade log | None |
| `--summary` | `-s` | Output text file for summary statistics | None |

### Help
```bash
python nifty_returns_calculator.py --help
```

## Trading Strategy Details

### Long Trade Execution
1. **Entry**: Buy at the day's HIGH price
2. **Exit**: Sell at the day's LOW price
3. **Result**: Typically results in a loss per trade (buying high, selling low)

### Short Trade Execution
1. **Entry**: Short sell at the day's LOW price
2. **Exit**: Cover at the day's HIGH price
3. **Result**: Typically results in a loss per trade (selling low, buying high)

### Risk Management

The position size for each trade is calculated to ensure maximum risk does not exceed the specified percentage (default 2%) of total capital:

```
Risk Amount = Current Capital × Risk Percentage
Risk Per Unit = |Entry Price - Exit Price|
Position Size = Risk Amount ÷ Risk Per Unit
```

Additionally, the position size is capped by available capital:
```
Max Position Size = Current Capital ÷ Entry Price
Final Position Size = min(Risk-Based Position, Max Position Size)
```

This ensures:
- ✅ No trade risks more than 2% of capital
- ✅ No trade requires more capital than available
- ✅ Capital is preserved even with consecutive losses

## Output

### Console Output

The script displays:
1. **Data loading summary**: Number of records, date range, price range
2. **Execution progress**: Number of trades executed
3. **Performance summary**: Detailed statistics (see below)

### Trade Log (CSV)

If `--output` is specified, generates a CSV file with columns:
- Date
- Direction (LONG/SHORT)
- Entry_Price
- Exit_Price
- Quantity
- PnL (Profit/Loss in absolute terms)
- PnL_Percent (Profit/Loss as percentage)
- Capital_After (Capital after trade)

### Summary Report

If `--summary` is specified, generates a text file with:

#### Capital & Returns
- Initial Capital
- Final Capital
- Total Return (absolute and percentage)

#### Trade Statistics
- Total Trades
- Winning Trades
- Losing Trades
- Win Rate (%)

#### Profit/Loss Analysis
- Average Win
- Average Loss
- Largest Win
- Largest Loss
- Average Trade Return (%)

#### Risk Metrics
- Max Drawdown (%)
- Sharpe Ratio (annualized, assuming 252 trading days)
- Profit Factor (Gross Profit / Gross Loss)
- Expectancy (Expected value per trade)

## Example Output

```
======================================================================
NIFTY OHLC TRADING STRATEGY - SUMMARY REPORT
======================================================================

📊 CAPITAL & RETURNS
  Initial Capital:        ₹100,000.00
  Final Capital:          ₹95,234.56
  Total Return:           ₹-4,765.44
  Total Return (%):       -4.77%

📈 TRADE STATISTICS
  Total Trades:           100
  Winning Trades:         45
  Losing Trades:          55
  Win Rate:               45.00%

💰 PROFIT/LOSS ANALYSIS
  Average Win:            ₹450.25
  Average Loss:           ₹-520.30
  Largest Win:            ₹2,150.50
  Largest Loss:           ₹-3,200.75
  Avg Trade Return (%):   -0.05%

⚠️  RISK METRICS
  Max Drawdown:           -8.45%
  Sharpe Ratio:           -0.32
  Profit Factor:          0.86
  Expectancy:             ₹-47.65

======================================================================
```

## Understanding the Strategy

### Important Note on Strategy Performance

This strategy is designed as specified in the requirements:
- Long trades buy at HIGH and sell at LOW (typically losing trades)
- Short trades sell at LOW and buy at HIGH (typically losing trades)

**This is NOT a profitable trading strategy** - it's designed to demonstrate:
- Risk management implementation
- Position sizing calculations
- Performance metrics calculation
- Trade logging and reporting

### Why These Trades Typically Lose

1. **Long trades**: Buying at the highest point of the day and selling at the lowest point guarantees a loss on most days
2. **Short trades**: Selling at the lowest point and buying back at the highest point also guarantees a loss

### Realistic Use Cases

This calculator can be adapted for:
- Backtesting other strategies by modifying entry/exit logic
- Understanding risk management principles
- Learning position sizing techniques
- Analyzing trade performance metrics

## Error Handling

The script gracefully handles:
- ✅ Missing data files
- ✅ Invalid date formats
- ✅ Missing or invalid OHLC values
- ✅ Invalid OHLC relationships (e.g., High < Low)
- ✅ Different file separators
- ✅ Case-insensitive column names
- ✅ Days with no trading opportunity (High = Low)

## Code Structure

### Main Class: `NiftyTradeCalculator`

Methods:
- `load_data()`: Load and validate OHLC data from file
- `calculate_position_size()`: Calculate position size based on risk management
- `execute_long_trade()`: Execute a long trade
- `execute_short_trade()`: Execute a short trade
- `run_strategy()`: Run the complete trading strategy
- `calculate_statistics()`: Calculate performance statistics
- `generate_trade_log()`: Generate trade log DataFrame/CSV
- `print_summary()`: Print formatted summary to console
- `save_summary()`: Save summary to text file

## Sample Data

A sample data file `sample_nifty_data.csv` is provided with the script, containing:
- Date range: 2000-01-03 to 2025-07-31 (sample data)
- Realistic OHLC prices for Nifty

You can test the script with:
```bash
python nifty_returns_calculator.py --input sample_nifty_data.csv
```

## Customization

### Modifying the Strategy

To implement a different trading strategy, modify the `run_strategy()` method or the individual trade execution methods:

```python
# Example: Modify to buy at open and sell at close
def execute_modified_trade(self, date, open_price, close_price):
    entry_price = open_price
    exit_price = close_price
    # ... rest of the logic
```

### Adding New Metrics

Add new statistics in the `calculate_statistics()` method:

```python
# Example: Calculate Sortino Ratio
downside_returns = returns_series[returns_series < 0]
downside_std = downside_returns.std()
sortino_ratio = (avg_return / downside_std) * np.sqrt(252)
stats['Sortino_Ratio'] = sortino_ratio
```

## Troubleshooting

### "FileNotFoundError: Data file not found"
- Ensure the file path is correct
- Use absolute path or ensure you're running from the correct directory

### "Unable to parse file"
- Check that the file has at least 5 columns (Date + OHLC)
- Verify the separator is one of: comma, tab, semicolon, or pipe
- Ensure column headers are present

### "Missing required columns"
- Verify column names contain: Date, Open, High, Low, Close (case-insensitive)
- Check for typos in column headers

### No trades executed
- Check if all High = Low (no intraday range)
- Verify data is properly formatted and loaded
- Ensure capital is sufficient for at least one trade

## Performance Considerations

- The script processes data row-by-row, suitable for datasets up to millions of rows
- For extremely large datasets (10M+ rows), consider batch processing
- Memory usage is proportional to number of trades executed

## License

This script is provided as-is for educational and analytical purposes.

## Author

SMBC Trading Analytics  
October 2025

## Support

For issues, questions, or suggestions, please open an issue in the repository.

## Version History

- **v1.0.0** (2025-10-30): Initial release
  - OHLC strategy implementation
  - Risk management (2% per trade)
  - Comprehensive statistics and reporting
  - Trade log generation
  - Multiple file format support
