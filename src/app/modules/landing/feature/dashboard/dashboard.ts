
import {Component, OnInit} from '@angular/core';
import Highcharts from 'highcharts';
import 'highcharts/highcharts-3d';
import {HighchartsChartModule} from 'highcharts-angular';
import {BUTTON_VISIBILITY} from '../../../../shared/constant/button-signals.constant';

@Component({
  selector: 'app-dashboard',
  imports: [
    HighchartsChartModule
  ],
  templateUrl: './dashboard.html',
  standalone: true,
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  pieColors = [
    // Soft Neutrals & Calm Tones
    '#B2F5EA', // Soft Teal - Savings
    '#A0AEC0', // Cool Gray - Current
    '#FFC4B9', // Light Orange - Fixed Deposit
    '#bfc6f7', // Light Violet - Recurring
    '#E2E8F0', // Off White Gray - Camt 053
    '#CBD5E0', // Light Gray
    '#C6F6D5', // Mint Green
    '#FED7E2', // Soft Pink
    '#FAF089', // Pale Yellow
  ];
  barColors = [
    '#4C6EF5', // Soft Indigo
    '#6C8EBF', // Muted Blue
    '#A0C4FF', // Soft Sky Blue
    '#BDB2FF', // Muted Purple
    '#FFDAC1', // Soft Peach
    '#FFB5A7', // Light Coral
    '#C8E6C9', // Minty Green
    '#DDE5B6', // Light Olive
    '#F0EFEB',  // Off-white Beige
  ];
  Highcharts: typeof Highcharts = Highcharts;
  pieChartFilter: 'weekly' | 'monthly' = 'weekly';
  barChartFilter: 'weekly' | 'monthly' = 'weekly';

  constructor() {
  }

  ngOnInit(): void {
    BUTTON_VISIBILITY.set({
      save: false,
      update: false,
      view: false,
      delete: false,
      exit: false,
      reset: false
    });
  }

  setPieChartFilter(filter: 'weekly' | 'monthly'): void {
    this.pieChartFilter = filter;
    this.updatePieChart();
  }

  setBarChartFilter(filter: 'weekly' | 'monthly'): void {
    this.barChartFilter = filter;
    this.updateBarChart();
  }

  updatePieChart(): void {
    if (this.pieChartFilter === 'weekly') {
      this.chartOptionsPie = {
        ...this.chartOptionsPie,
        series: [{
          type: 'pie',
          name: 'Total Incoming Messages',
          data: [
            ['Pacs 009', 150000],
            ['Pacs 008', 250000],
            ['Pacs 002', 150000],
            ['Pacs 004', 250000],
            ['Camt 053', 200000]
          ]
        }]
      };
    } else {
      this.chartOptionsPie = {
        ...this.chartOptionsPie,
        series: [{
          type: 'pie',
          name: 'Total Incoming Messages',
          data: [
            ['Pacs 009', 2800000],
            ['Pacs 008', 4200000],
            ['Pacs 002', 2800000],
            ['Pacs 004', 4200000],
            ['Camt 053', 3500000]
          ]
        }]
      };
    }
  }

  updateBarChart(): void {
    if (this.barChartFilter === 'weekly') {
      this.chartOptionsBar = {
        ...this.chartOptionsBar,
        yAxis: {
          allowDecimals: false,
          min: 0,
          max: 4000,
          title: {
            text: 'Message Count'
          }
        },
        series: [
          {
            name: 'JPMorgan Chase',
            data: [2530, 3220, 2810, 3805, 2250],
            type: 'column'
          },
          {
            name: 'HSBC Bank',
            data: [3805, 2505, 2205, 3505, 3270],
            type: 'column'
          },
          {
            name: 'Deutsche Bank',
            data: [2250, 3805, 3505, 2205, 2505],
            type: 'column'
          },
          {
            name: 'Standard Chartered',
            data: [3505, 3205, 3005, 3805, 3005],
            type: 'column'
          }
        ]
      };
    } else {
      this.chartOptionsBar = {
        ...this.chartOptionsBar,
        yAxis: {
          allowDecimals: false,
          min: 1000,
          max: 100000,
          title: {
            text: 'Message Count'
          }
        },
        series: [
          {
            name: 'JPMorgan Chase',
            data: [95020, 72020, 68020, 82020, 88020],
            type: 'column'
          },
          {
            name: 'HSBC Bank',
            data: [82020, 68020, 62020, 78020, 82020],
            type: 'column'
          },
          {
            name: 'Deutsche Bank',
            data: [88020, 72020, 68020, 78020, 82020],
            type: 'column'
          },
          {
            name: 'Standard Chartered',
            data: [78020, 62020, 58020, 72020, 76020],
            type: 'column'
          }
        ]
      };
    }
  }

  chartOptionsPie: Highcharts.Options = {
    colors: this.pieColors,
    chart: {
      type: 'pie',
      height: 320,
      backgroundColor: 'transparent',
      options3d: {
        enabled: true,
        alpha: 55,
        beta: 0,
      },
    },
    title: {text: ''},
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
      y: 0,
      itemStyle: {
        color: '#333',
      },
    },
    plotOptions: {
      pie: {
        minSize: 0, // Ensures even small values are visible
        ignoreHiddenPoint: false, // Ensures small values are not ignored
        showInLegend: true,
        innerSize: 90,
        depth: 40,
        dataLabels: {enabled: true, format: '{point.name}: {point.y}'},
      },
    },
    series: [{
      type: 'pie',
      name: 'Total Incoming Messages',
      data: [
        ['Pacs 009', 150000],
        ['Pacs 008', 250000],
        ['Pacs 002', 150000],
        ['Pacs 004', 250000],
        ['Camt 053', 200000]
      ]
    }],
    credits: {
      enabled: false,
    },
  };

  chartOptionsBar: Highcharts.Options = {
    colors: this.barColors,
    chart: {
      type: 'column',
      height: 320,
      backgroundColor: 'transparent',
      marginTop: 55,
      marginBottom: 80,

      marginRight: 20,
    },
    title: {
      text: '',
      align: 'left',
    },
    xAxis: {
      categories: ['Pacs 008', 'Pacs 009', 'Camt 053', 'Pacs 002', 'Pacs 004']
    },
    yAxis: {
      allowDecimals: false,
      min: 0,
      title: {
        text: 'Message Count'
      }
    },
    tooltip: {
      pointFormat: '<b>{x}</b><br/>{series.name}: {y} messages'
    },
    plotOptions: {
      column: {
        stacking: undefined
      }
    },
    series: [
      {
        name: 'AB Bank Mumbai',
        data: [2530, 3220, 2810, 3805, 2250],
        type: 'column'
      },
      {
        name: 'Reagent Bank',
        data: [3805, 2505, 2205, 3505, 3270],
        type: 'column'
      },
      {
        name: 'Citi Bank',
        data: [3205, 2805, 2505, 3205, 3505],
        type: 'column'
      },
      {
        name: 'HSBC',
        data: [3505, 2205, 2345, 2805, 3005],
        type: 'column'
      }
    ],
    credits: {
      enabled: false
    }
  };


}
