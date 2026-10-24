import React, { useState, useEffect } from 'react';
import HeroBanner from '../components/dashboard/HeroBanner';
import SmartAlerts from '../components/dashboard/SmartAlerts';
import BmiCalculator from '../components/dashboard/BmiCalculator';
import AiInsightsCard from '../components/dashboard/AiInsightsCard';
import { getDashboardSummaryApi } from '../api/dashboard';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const data = await getDashboardSummaryApi();
      setSummary(data);
    } catch (err) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-pink-600 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm font-semibold text-slate-600">Loading your health dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Hero Section */}
      <HeroBanner summary={summary} />

      {/* Smart Alerts & BMI Profile Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <SmartAlerts alerts={summary?.alerts || []} />
        <BmiCalculator
          bmi={summary?.bmi}
          bmiCategory={summary?.bmi_category}
          onUpdated={fetchSummary}
        />
      </div>

      {/* AI Health Insights Card */}
      <AiInsightsCard />

    </div>
  );
}
