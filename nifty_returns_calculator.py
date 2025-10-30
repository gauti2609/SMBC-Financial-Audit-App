#!/usr/bin/env python3
"""
Nifty OHLC Trading Strategy Returns Calculator

This script calculates returns from trading Nifty using daily OHLC data based on a 
specific strategy with strict risk management.

Strategy:
- Long trades: Enter at day's high, exit at day's low
- Short trades: Enter at day's low, exit at day's high
- Risk Management: Maximum 2% risk per trade of total capital
- Capital Deployment: 100% capital can be deployed per trade

Author: SMBC Trading Analytics
Date: October 2025
"""

import pandas as pd
import numpy as np
import argparse
import sys
from datetime import datetime
from pathlib import Path


class NiftyTradeCalculator:
    """
    Calculator for Nifty trading returns based on OHLC strategy with risk management.
    """
    
    def __init__(self, initial_capital=100000, risk_per_trade=0.02):
        """
        Initialize the calculator with capital and risk parameters.
        
        Args:
            initial_capital (float): Starting capital amount (default: 100,000)
            risk_per_trade (float): Maximum risk per trade as fraction (default: 0.02 for 2%)
        """
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        self.risk_per_trade = risk_per_trade
        self.trades = []
        
    def load_data(self, filepath):
        """
        Load OHLC data from CSV or TXT file.
        
        Expected format: Date, Open, High, Low, Close
        Handles various date formats and separators (comma, tab, semicolon).
        
        Args:
            filepath (str or Path): Path to the data file
            
        Returns:
            pandas.DataFrame: Loaded and validated OHLC data
            
        Raises:
            FileNotFoundError: If file doesn't exist
            ValueError: If data format is invalid
        """
        filepath = Path(filepath)
        
        if not filepath.exists():
            raise FileNotFoundError(f"Data file not found: {filepath}")
        
        # Try different separators
        separators = [',', '\t', ';', '|']
        df = None
        
        for sep in separators:
            try:
                df = pd.read_csv(filepath, sep=sep)
                if len(df.columns) >= 5:  # At least Date + OHLC
                    break
            except Exception:
                continue
        
        if df is None or len(df.columns) < 5:
            raise ValueError("Unable to parse file. Expected columns: Date, Open, High, Low, Close")
        
        # Standardize column names (case-insensitive matching)
        df.columns = df.columns.str.strip()
        column_mapping = {}
        
        for col in df.columns:
            col_lower = col.lower()
            if 'date' in col_lower:
                column_mapping[col] = 'Date'
            elif 'open' in col_lower:
                column_mapping[col] = 'Open'
            elif 'high' in col_lower:
                column_mapping[col] = 'High'
            elif 'low' in col_lower:
                column_mapping[col] = 'Low'
            elif 'close' in col_lower:
                column_mapping[col] = 'Close'
        
        df = df.rename(columns=column_mapping)
        
        # Validate required columns
        required = ['Date', 'Open', 'High', 'Low', 'Close']
        missing = set(required) - set(df.columns)
        if missing:
            raise ValueError(f"Missing required columns: {missing}")
        
        # Keep only required columns
        df = df[required].copy()
        
        # Parse dates
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
        
        # Convert OHLC to numeric
        for col in ['Open', 'High', 'Low', 'Close']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Remove rows with missing data
        initial_rows = len(df)
        df = df.dropna()
        removed_rows = initial_rows - len(df)
        
        if removed_rows > 0:
            print(f"Warning: Removed {removed_rows} rows with missing/invalid data")
        
        if len(df) == 0:
            raise ValueError("No valid data rows after cleaning")
        
        # Sort by date
        df = df.sort_values('Date').reset_index(drop=True)
        
        # Validate OHLC relationships
        invalid_rows = (df['High'] < df['Low']) | (df['High'] < df['Open']) | \
                      (df['High'] < df['Close']) | (df['Low'] > df['Open']) | \
                      (df['Low'] > df['Close'])
        
        if invalid_rows.any():
            print(f"Warning: Found {invalid_rows.sum()} rows with invalid OHLC relationships (High < Low, etc.)")
            df = df[~invalid_rows].reset_index(drop=True)
        
        print(f"\nData loaded successfully:")
        print(f"  - Total records: {len(df)}")
        print(f"  - Date range: {df['Date'].min().date()} to {df['Date'].max().date()}")
        print(f"  - Price range: {df['Low'].min():.2f} to {df['High'].max():.2f}")
        
        return df
    
    def calculate_position_size(self, entry_price, stop_loss_price):
        """
        Calculate position size based on risk management rules.
        
        Maximum risk per trade is 2% of total capital.
        Risk per share = |entry_price - stop_loss_price|
        Position size = (Capital * Risk%) / Risk per share
        
        However, maximum capital deployed cannot exceed current capital.
        
        Args:
            entry_price (float): Entry price per unit
            stop_loss_price (float): Stop loss price per unit
            
        Returns:
            int: Number of units to trade
        """
        risk_amount = self.current_capital * self.risk_per_trade
        risk_per_unit = abs(entry_price - stop_loss_price)
        
        if risk_per_unit == 0:
            return 0
        
        # Calculate position size based on risk
        position_size = int(risk_amount / risk_per_unit)
        
        # Ensure we don't exceed current capital
        max_affordable = int(self.current_capital / entry_price)
        position_size = min(position_size, max_affordable)
        
        return position_size
    
    def execute_long_trade(self, date, high, low):
        """
        Execute a long trade: Buy at high, sell at low.
        
        Args:
            date: Trading date
            high (float): Day's high price (entry)
            low (float): Day's low price (exit)
            
        Returns:
            dict: Trade details
        """
        entry_price = high
        exit_price = low
        
        # Position sizing with stop loss at exit price
        quantity = self.calculate_position_size(entry_price, exit_price)
        
        if quantity == 0:
            return None
        
        # Calculate P&L
        pnl = (exit_price - entry_price) * quantity
        pnl_percent = ((exit_price - entry_price) / entry_price) * 100
        
        # Update capital
        self.current_capital += pnl
        
        trade = {
            'Date': date,
            'Direction': 'LONG',
            'Entry_Price': entry_price,
            'Exit_Price': exit_price,
            'Quantity': quantity,
            'PnL': pnl,
            'PnL_Percent': pnl_percent,
            'Capital_After': self.current_capital
        }
        
        return trade
    
    def execute_short_trade(self, date, high, low):
        """
        Execute a short trade: Sell at low, buy back at high.
        
        Args:
            date: Trading date
            high (float): Day's high price (exit/cover)
            low (float): Day's low price (entry)
            
        Returns:
            dict: Trade details
        """
        entry_price = low
        exit_price = high
        
        # Position sizing with stop loss at exit price
        quantity = self.calculate_position_size(entry_price, exit_price)
        
        if quantity == 0:
            return None
        
        # Calculate P&L (short trade: profit when price falls)
        pnl = (entry_price - exit_price) * quantity
        pnl_percent = ((entry_price - exit_price) / entry_price) * 100
        
        # Update capital
        self.current_capital += pnl
        
        trade = {
            'Date': date,
            'Direction': 'SHORT',
            'Entry_Price': entry_price,
            'Exit_Price': exit_price,
            'Quantity': quantity,
            'PnL': pnl,
            'PnL_Percent': pnl_percent,
            'Capital_After': self.current_capital
        }
        
        return trade
    
    def run_strategy(self, df, trade_type='both'):
        """
        Run the trading strategy on OHLC data.
        
        Args:
            df (pandas.DataFrame): OHLC data
            trade_type (str): Type of trades - 'long', 'short', or 'both'
            
        Returns:
            list: List of all trades executed
        """
        self.trades = []
        
        print(f"\nExecuting {trade_type.upper()} strategy...")
        print(f"Initial Capital: ₹{self.initial_capital:,.2f}")
        print(f"Risk per trade: {self.risk_per_trade * 100}%")
        
        for idx, row in df.iterrows():
            date = row['Date']
            high = row['High']
            low = row['Low']
            
            # Skip if high equals low (no opportunity)
            if high == low:
                continue
            
            if trade_type in ['long', 'both']:
                trade = self.execute_long_trade(date, high, low)
                if trade:
                    self.trades.append(trade)
            
            if trade_type in ['short', 'both']:
                trade = self.execute_short_trade(date, high, low)
                if trade:
                    self.trades.append(trade)
        
        print(f"Total trades executed: {len(self.trades)}")
        
        return self.trades
    
    def calculate_statistics(self):
        """
        Calculate comprehensive trading statistics.
        
        Returns:
            dict: Dictionary containing all statistics
        """
        if not self.trades:
            return {
                'error': 'No trades executed'
            }
        
        df_trades = pd.DataFrame(self.trades)
        
        # Basic statistics
        total_trades = len(df_trades)
        winning_trades = df_trades[df_trades['PnL'] > 0]
        losing_trades = df_trades[df_trades['PnL'] < 0]
        
        total_return = self.current_capital - self.initial_capital
        total_return_percent = (total_return / self.initial_capital) * 100
        
        # Win/Loss statistics
        num_wins = len(winning_trades)
        num_losses = len(losing_trades)
        win_rate = (num_wins / total_trades) * 100 if total_trades > 0 else 0
        
        avg_win = winning_trades['PnL'].mean() if num_wins > 0 else 0
        avg_loss = losing_trades['PnL'].mean() if num_losses > 0 else 0
        
        # Calculate drawdown
        df_trades['Cumulative_Return'] = (df_trades['Capital_After'] / self.initial_capital - 1) * 100
        df_trades['Running_Max'] = df_trades['Capital_After'].cummax()
        df_trades['Drawdown'] = ((df_trades['Capital_After'] - df_trades['Running_Max']) / 
                                  df_trades['Running_Max']) * 100
        
        max_drawdown = df_trades['Drawdown'].min()
        
        # Risk-adjusted metrics
        returns_series = df_trades['PnL_Percent']
        avg_return = returns_series.mean()
        std_return = returns_series.std()
        
        # Sharpe Ratio (assuming 0% risk-free rate, annualized)
        # Using 252 trading days per year approximation
        sharpe_ratio = (avg_return / std_return) * np.sqrt(252) if std_return != 0 else 0
        
        # Profit factor
        total_wins = winning_trades['PnL'].sum() if num_wins > 0 else 0
        total_losses = abs(losing_trades['PnL'].sum()) if num_losses > 0 else 1
        profit_factor = total_wins / total_losses if total_losses != 0 else float('inf')
        
        # Expectancy
        expectancy = (win_rate/100 * avg_win) - ((100-win_rate)/100 * abs(avg_loss))
        
        stats = {
            'Initial_Capital': self.initial_capital,
            'Final_Capital': self.current_capital,
            'Total_Return': total_return,
            'Total_Return_Percent': total_return_percent,
            'Total_Trades': total_trades,
            'Winning_Trades': num_wins,
            'Losing_Trades': num_losses,
            'Win_Rate_Percent': win_rate,
            'Average_Win': avg_win,
            'Average_Loss': avg_loss,
            'Largest_Win': winning_trades['PnL'].max() if num_wins > 0 else 0,
            'Largest_Loss': losing_trades['PnL'].min() if num_losses > 0 else 0,
            'Average_Trade_Return_Percent': avg_return,
            'Max_Drawdown_Percent': max_drawdown,
            'Sharpe_Ratio': sharpe_ratio,
            'Profit_Factor': profit_factor,
            'Expectancy': expectancy
        }
        
        return stats
    
    def generate_trade_log(self, output_file=None):
        """
        Generate detailed trade log.
        
        Args:
            output_file (str, optional): Path to save CSV file
            
        Returns:
            pandas.DataFrame: Trade log dataframe
        """
        if not self.trades:
            print("No trades to log")
            return None
        
        df_trades = pd.DataFrame(self.trades)
        
        # Format for better readability
        df_trades['Date'] = pd.to_datetime(df_trades['Date']).dt.strftime('%Y-%m-%d')
        
        # Round numeric columns
        numeric_cols = ['Entry_Price', 'Exit_Price', 'PnL', 'PnL_Percent', 'Capital_After']
        for col in numeric_cols:
            df_trades[col] = df_trades[col].round(2)
        
        if output_file:
            df_trades.to_csv(output_file, index=False)
            print(f"\nTrade log saved to: {output_file}")
        
        return df_trades
    
    def print_summary(self):
        """
        Print a formatted summary of trading results.
        """
        stats = self.calculate_statistics()
        
        if 'error' in stats:
            print(f"\nError: {stats['error']}")
            return
        
        print("\n" + "="*70)
        print("NIFTY OHLC TRADING STRATEGY - SUMMARY REPORT")
        print("="*70)
        
        print("\n📊 CAPITAL & RETURNS")
        print(f"  Initial Capital:        ₹{stats['Initial_Capital']:,.2f}")
        print(f"  Final Capital:          ₹{stats['Final_Capital']:,.2f}")
        print(f"  Total Return:           ₹{stats['Total_Return']:,.2f}")
        print(f"  Total Return (%):       {stats['Total_Return_Percent']:.2f}%")
        
        print("\n📈 TRADE STATISTICS")
        print(f"  Total Trades:           {stats['Total_Trades']}")
        print(f"  Winning Trades:         {stats['Winning_Trades']}")
        print(f"  Losing Trades:          {stats['Losing_Trades']}")
        print(f"  Win Rate:               {stats['Win_Rate_Percent']:.2f}%")
        
        print("\n💰 PROFIT/LOSS ANALYSIS")
        print(f"  Average Win:            ₹{stats['Average_Win']:,.2f}")
        print(f"  Average Loss:           ₹{stats['Average_Loss']:,.2f}")
        print(f"  Largest Win:            ₹{stats['Largest_Win']:,.2f}")
        print(f"  Largest Loss:           ₹{stats['Largest_Loss']:,.2f}")
        print(f"  Avg Trade Return (%):   {stats['Average_Trade_Return_Percent']:.2f}%")
        
        print("\n⚠️  RISK METRICS")
        print(f"  Max Drawdown:           {stats['Max_Drawdown_Percent']:.2f}%")
        print(f"  Sharpe Ratio:           {stats['Sharpe_Ratio']:.2f}")
        print(f"  Profit Factor:          {stats['Profit_Factor']:.2f}")
        print(f"  Expectancy:             ₹{stats['Expectancy']:.2f}")
        
        print("\n" + "="*70)
    
    def save_summary(self, output_file):
        """
        Save summary statistics to a text file.
        
        Args:
            output_file (str): Path to output file
        """
        stats = self.calculate_statistics()
        
        if 'error' in stats:
            print(f"Cannot save summary: {stats['error']}")
            return
        
        with open(output_file, 'w') as f:
            f.write("="*70 + "\n")
            f.write("NIFTY OHLC TRADING STRATEGY - SUMMARY REPORT\n")
            f.write("="*70 + "\n\n")
            
            f.write("CAPITAL & RETURNS\n")
            f.write(f"  Initial Capital:        ₹{stats['Initial_Capital']:,.2f}\n")
            f.write(f"  Final Capital:          ₹{stats['Final_Capital']:,.2f}\n")
            f.write(f"  Total Return:           ₹{stats['Total_Return']:,.2f}\n")
            f.write(f"  Total Return (%):       {stats['Total_Return_Percent']:.2f}%\n\n")
            
            f.write("TRADE STATISTICS\n")
            f.write(f"  Total Trades:           {stats['Total_Trades']}\n")
            f.write(f"  Winning Trades:         {stats['Winning_Trades']}\n")
            f.write(f"  Losing Trades:          {stats['Losing_Trades']}\n")
            f.write(f"  Win Rate:               {stats['Win_Rate_Percent']:.2f}%\n\n")
            
            f.write("PROFIT/LOSS ANALYSIS\n")
            f.write(f"  Average Win:            ₹{stats['Average_Win']:,.2f}\n")
            f.write(f"  Average Loss:           ₹{stats['Average_Loss']:,.2f}\n")
            f.write(f"  Largest Win:            ₹{stats['Largest_Win']:,.2f}\n")
            f.write(f"  Largest Loss:           ₹{stats['Largest_Loss']:,.2f}\n")
            f.write(f"  Avg Trade Return (%):   {stats['Average_Trade_Return_Percent']:.2f}%\n\n")
            
            f.write("RISK METRICS\n")
            f.write(f"  Max Drawdown:           {stats['Max_Drawdown_Percent']:.2f}%\n")
            f.write(f"  Sharpe Ratio:           {stats['Sharpe_Ratio']:.2f}\n")
            f.write(f"  Profit Factor:          {stats['Profit_Factor']:.2f}\n")
            f.write(f"  Expectancy:             ₹{stats['Expectancy']:.2f}\n\n")
            
            f.write("="*70 + "\n")
        
        print(f"\nSummary saved to: {output_file}")


def main():
    """
    Main function to run the Nifty returns calculator from command line.
    """
    parser = argparse.ArgumentParser(
        description='Calculate Nifty returns using OHLC strategy with risk management',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic usage with default settings
  python nifty_returns_calculator.py --input nifty_data.csv
  
  # With custom initial capital and risk
  python nifty_returns_calculator.py --input nifty_data.csv --capital 500000 --risk 0.01
  
  # Save outputs to specific files
  python nifty_returns_calculator.py --input nifty_data.csv --output trades.csv --summary summary.txt
  
  # Run only long trades
  python nifty_returns_calculator.py --input nifty_data.csv --type long

Strategy Details:
  - Long trades: Buy at day's HIGH, sell at day's LOW
  - Short trades: Sell at day's LOW, buy back at day's HIGH
  - Risk Management: Maximum 2% risk per trade (default)
  - Position sizing calculated based on risk management rules
        """
    )
    
    parser.add_argument(
        '--input', '-i',
        required=True,
        help='Input CSV/TXT file with OHLC data (Date, Open, High, Low, Close)'
    )
    
    parser.add_argument(
        '--capital', '-c',
        type=float,
        default=100000,
        help='Initial capital amount (default: 100000)'
    )
    
    parser.add_argument(
        '--risk', '-r',
        type=float,
        default=0.02,
        help='Maximum risk per trade as decimal (default: 0.02 for 2%%)'
    )
    
    parser.add_argument(
        '--type', '-t',
        choices=['long', 'short', 'both'],
        default='both',
        help='Type of trades to execute (default: both)'
    )
    
    parser.add_argument(
        '--output', '-o',
        help='Output CSV file for trade log (optional)'
    )
    
    parser.add_argument(
        '--summary', '-s',
        help='Output text file for summary statistics (optional)'
    )
    
    args = parser.parse_args()
    
    try:
        print("\n" + "="*70)
        print("NIFTY OHLC TRADING STRATEGY CALCULATOR")
        print("="*70)
        
        # Initialize calculator
        calculator = NiftyTradeCalculator(
            initial_capital=args.capital,
            risk_per_trade=args.risk
        )
        
        # Load data
        print(f"\nLoading data from: {args.input}")
        df = calculator.load_data(args.input)
        
        # Run strategy
        calculator.run_strategy(df, trade_type=args.type)
        
        # Generate outputs
        calculator.print_summary()
        
        # Save trade log
        if args.output:
            calculator.generate_trade_log(args.output)
        
        # Save summary
        if args.summary:
            calculator.save_summary(args.summary)
        
        print("\n✅ Calculation completed successfully!")
        
    except FileNotFoundError as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
    except ValueError as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
