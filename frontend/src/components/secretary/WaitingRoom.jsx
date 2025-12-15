import React from 'react';

const WaitingRoom = ({ appointments, onUpdateStatus }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h3 className="text-xl text-gray-500">Waiting room is empty</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {appointments.map((appt) => (
        <div key={appt.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{appt.patient.fullName}</h3>
              <p className="text-gray-600">📱 {appt.patient.phone}</p>
              <p className="text-sm text-gray-400 mt-1">
                Appt: {appt.appointmentTime}
              </p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
              Waiting
            </span>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onUpdateStatus(appt.id, 'scheduled')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded text-sm transition"
            >
              Undo Check-in
            </button>
            <button
              onClick={() => onUpdateStatus(appt.id, 'cancelled', 'No show')}
              className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-1 px-2 rounded text-sm transition"
            >
              No Show
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WaitingRoom;
