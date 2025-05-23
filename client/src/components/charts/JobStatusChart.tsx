import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function JobStatusChart() {
  const { data: jobStatusData, isLoading } = useQuery({
    queryKey: ["/api/analytics/job-status"],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: 'Inter, ui-sans-serif, system-ui',
          },
          color: '#64748b',
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.backgroundColor[i],
                  lineWidth: 0,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#F59E0B',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((context.parsed / total) * 100);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
  };

  const chartData = {
    labels: jobStatusData?.map((item: any) => item.status) || ['Completed', 'In Progress', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: jobStatusData?.map((item: any) => item.count) || [65, 20, 10, 5],
        backgroundColor: [
          '#10B981', // Emerald for completed
          '#3B82F6', // Blue for in progress
          '#F59E0B', // Amber for pending
          '#EF4444', // Red for cancelled
        ],
        borderWidth: 0,
        hoverBackgroundColor: [
          '#059669', // Darker emerald
          '#2563EB', // Darker blue
          '#D97706', // Darker amber
          '#DC2626', // Darker red
        ],
        hoverBorderWidth: 2,
        hoverBorderColor: '#ffffff',
      },
    ],
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Job Status Distribution</CardTitle>
            <div className="w-8 h-8 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Job Status Distribution</CardTitle>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}
