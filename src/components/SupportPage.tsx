import React from "react";

type Props = {
  companyName: string;
  companyEmail: string;
  companyAddress: string;
  companyLocation: string;
  updatedAt: string;
};

export default function Support({
  companyName,
  companyEmail,
  companyAddress,
  companyLocation,
  updatedAt,
}: Props) {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">

      <h2 className="text-xl font-bold mb-4 text-center">{companyName}</h2>

      <h4 className="text-lg font-semibold mb-2">Contact Information</h4>
      <p className="text-gray-700 mb-2">
        {companyName} welcomes your questions or comments regarding this
        application. If you have any questions or doubts about the application,
        please contact {companyName} at:
      </p>

      <div className="mb-4">
        <p className="text-gray-700">{companyName}</p>
        <p className="text-gray-700">{companyAddress}</p>
        <p className="text-gray-700">{companyLocation}</p>
      </div>

      <div className="mb-6">
        <p className="text-gray-700">Email Address:</p>
        <a
          href={`mailto:${companyEmail}`}
          className="text-blue-500 hover:text-blue-700 transition-colors"
        >
          {companyEmail}
        </a>
      </div>

      <p className="text-gray-500 text-sm">Last updated: {updatedAt}</p>
    </div>
  );
}
