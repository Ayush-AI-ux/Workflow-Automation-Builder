// import React, { useState, useEffect } from 'react';
// import { X, Clock, Calendar, Save, AlertCircle, CheckCircle } from 'lucide-react';
// import axios from 'axios';

// const ScheduleModal = ({ isOpen, onClose, workflowId, workflowName, currentSchedule }) => {
//   const [frequency, setFrequency] = useState('daily');
//   const [time, setTime] = useState('09:00');
//   const [timezone, setTimezone] = useState('UTC');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     if (currentSchedule) {
//       setFrequency(currentSchedule.frequency || 'daily');
//       setTime(currentSchedule.time || '09:00');
//       setTimezone(currentSchedule.timezone || 'UTC');
//     }
//   }, [currentSchedule]);

//   const getToken = () => localStorage.getItem('token');

//   const handleEnableSchedule = async () => {
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const response = await axios.post(
//         `http://localhost:5000/api/schedule/enable/${workflowId}`,
//         {
//           frequency,
//           timezone,
//           time
//         },
//         {
//           headers: { Authorization: `Bearer ${getToken()}` }
//         }
//       );

//       setSuccess('Schedule enabled successfully!');
//       setTimeout(() => {
//         onClose(true); // Pass true to indicate schedule was updated
//       }, 1500);

//     } catch (err) {
//       console.error('Schedule error:', err);
//       setError(err.response?.data?.error || 'Failed to enable schedule');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDisableSchedule = async () => {
//     setLoading(true);
//     setError('');

//     try {
//       await axios.post(
//         `http://localhost:5000/api/schedule/disable/${workflowId}`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${getToken()}` }
//         }
//       );

//       setSuccess('Schedule disabled successfully!');
//       setTimeout(() => {
//         onClose(true);
//       }, 1500);

//     } catch (err) {
//       console.error('Disable error:', err);
//       setError(err.response?.data?.error || 'Failed to disable schedule');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getFrequencyDescription = () => {
//     switch (frequency) {
//       case 'hourly':
//         return 'Runs every hour on the hour';
//       case 'daily':
//         return `Runs every day at ${time}`;
//       case 'weekly':
//         return `Runs every Monday at ${time}`;
//       case 'monthly':
//         return `Runs on the 1st of every month at ${time}`;
//       default:
//         return '';
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Clock className="w-6 h-6" />
//               <div>
//                 <h2 className="text-xl font-bold">Schedule Workflow</h2>
//                 <p className="text-sm text-blue-100 mt-1">{workflowName}</p>
//               </div>
//             </div>
//             <button
//               onClick={() => onClose(false)}
//               className="hover:bg-white/20 p-2 rounded-lg transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6 space-y-6">
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
//               <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
//               <span className="text-sm">{error}</span>
//             </div>
//           )}

//           {success && (
//             <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
//               <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
//               <span className="text-sm">{success}</span>
//             </div>
//           )}

//           {/* Frequency Selection */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               <Calendar className="w-4 h-4 inline mr-1" />
//               Frequency
//             </label>
//             <select
//               value={frequency}
//               onChange={(e) => setFrequency(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               disabled={loading}
//             >
//               <option value="hourly">Every Hour</option>
//               <option value="daily">Daily</option>
//               <option value="weekly">Weekly (Monday)</option>
//               <option value="monthly">Monthly (1st of month)</option>
//             </select>
//             <p className="text-xs text-gray-500 mt-2">{getFrequencyDescription()}</p>
//           </div>

//           {/* Time Selection (for non-hourly) */}
//           {frequency !== 'hourly' && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 <Clock className="w-4 h-4 inline mr-1" />
//                 Time
//               </label>
//               <input
//                 type="time"
//                 value={time}
//                 onChange={(e) => setTime(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 disabled={loading}
//               />
//               <p className="text-xs text-gray-500 mt-2">24-hour format</p>
//             </div>
//           )}

//           {/* Timezone */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Timezone
//             </label>
//             <select
//               value={timezone}
//               onChange={(e) => setTimezone(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               disabled={loading}
//             >
//               <option value="UTC">UTC</option>
//               <option value="America/New_York">Eastern Time (ET)</option>
//               <option value="America/Chicago">Central Time (CT)</option>
//               <option value="America/Denver">Mountain Time (MT)</option>
//               <option value="America/Los_Angeles">Pacific Time (PT)</option>
//               <option value="Europe/London">London (GMT)</option>
//               <option value="Europe/Paris">Paris (CET)</option>
//               <option value="Asia/Tokyo">Tokyo (JST)</option>
//               <option value="Asia/Shanghai">Shanghai (CST)</option>
//               <option value="Asia/Kolkata">India (IST)</option>
//               <option value="Australia/Sydney">Sydney (AEDT)</option>
//             </select>
//           </div>

//           {/* Info Box */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <h4 className="text-sm font-semibold text-blue-900 mb-2">📌 How it works:</h4>
//             <ul className="text-xs text-blue-800 space-y-1">
//               <li>• Your workflow will run automatically at the scheduled time</li>
//               <li>• The trigger node will be executed to start the workflow</li>
//               <li>• You can view execution history in the dashboard</li>
//               <li>• You can disable the schedule anytime</li>
//             </ul>
//           </div>

//           {/* Preview */}
//           <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
//             <h4 className="text-sm font-semibold text-purple-900 mb-2">⏰ Schedule Preview:</h4>
//             <p className="text-sm text-gray-700">
//               <strong>{workflowName}</strong> will run <strong>{frequency}</strong>
//               {frequency !== 'hourly' && ` at ${time}`} ({timezone})
//             </p>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
//           <div className="flex gap-3">
//             {currentSchedule?.enabled ? (
//               <>
//                 <button
//                   onClick={handleDisableSchedule}
//                   disabled={loading}
//                   className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//                 >
//                   {loading ? 'Processing...' : 'Disable Schedule'}
//                 </button>
//                 <button
//                   onClick={handleEnableSchedule}
//                   disabled={loading}
//                   className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//                 >
//                   <Save className="w-4 h-4" />
//                   {loading ? 'Updating...' : 'Update Schedule'}
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button
//                   onClick={() => onClose(false)}
//                   disabled={loading}
//                   className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleEnableSchedule}
//                   disabled={loading}
//                   className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//                 >
//                   <Clock className="w-4 h-4" />
//                   {loading ? 'Enabling...' : 'Enable Schedule'}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ScheduleModal;

import React, { useState, useEffect } from 'react';
import { X, Clock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import cronstrue from 'cronstrue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const presets = {
  hourly: '0 * * * *',
  daily: '0 9 * * *',
  weekly: '0 9 * * 1',
  monthly: '0 9 1 * *',
};

const ScheduleModal = ({ isOpen, onClose, workflowId, workflowName, currentSchedule }) => {
  const [enabled, setEnabled] = useState(currentSchedule?.enabled || false);
  const [cron, setCron] = useState(currentSchedule?.cron || presets.daily);
  const [timezone, setTimezone] = useState(currentSchedule?.timezone || 'UTC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [humanCron, setHumanCron] = useState('');

  useEffect(() => {
    if (cron) {
      try {
        setHumanCron(cronstrue.toString(cron));
      } catch {
        setHumanCron('Invalid cron expression');
      }
    }
  }, [cron]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.put(`${API_URL}/api/schedule/${workflowId}`, { cron, timezone }, {
        withCredentials: true
      });
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/schedule/${workflowId}/toggle`, {}, { withCredentials: true });
      onClose(true);
    } catch (err) {
      setError('Failed to disable schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-400" />
            Schedule Workflow
          </h2>
          <button onClick={() => onClose(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-lg text-white font-medium">{workflowName}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Frequency Preset</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(presets).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setCron(value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    cron === value
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300">Custom Cron Expression</label>
            <input
              type="text"
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              placeholder="0 9 * * *"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">New York (EST/EDT)</option>
              <option value="America/Chicago">Chicago (CST/CDT)</option>
              <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <p className="text-sm text-slate-300 mb-1">This workflow will run:</p>
            <p className="text-lg font-semibold text-purple-300">
              {humanCron || 'Invalid expression'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Timezone: {timezone}</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onClose(false)}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition"
            >
              Cancel
            </button>

            {enabled && (
              <button
                onClick={handleDisable}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition"
              >
                Disable Schedule
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg text-white font-medium transition flex items-center justify-center gap-2"
            >
              {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Enable Schedule</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;