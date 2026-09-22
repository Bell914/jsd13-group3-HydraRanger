import React from "react";

export default function CheckoutStepper({ currentStep, onStepClick }) {
  const steps = [
    { id: 1, label: "Contact" },
    { id: 2, label: "Shipping" },
    { id: 3, label: "Payment" },
    { id: 4, label: "Review" },
  ];

  return (
    <div className="w-full flex flex-col items-center mb-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
        Checkout
      </h1>

      {/* Stepper container */}
      <div className="flex items-center justify-center w-full max-w-md px-4">
        {steps.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isClickable = step.id < currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle & Label */}
              <div className="flex flex-col items-center relative flex-shrink-0">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(step.id)}
                  aria-label={`Go to step ${step.label}`}
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                    isCompleted
                      ? "bg-[#0055aa] text-white cursor-pointer hover:bg-[#004488]"
                      : isActive
                        ? "border-2 border-[#0055aa] text-[#0055aa] bg-white ring-2 ring-[#0055aa]/20"
                        : "border-2 border-gray-300 text-gray-400 bg-white cursor-default"
                  }`}
                >
                  {step.id}
                </button>
                <span
                  className={`mt-1.5 sm:mt-2 text-[10px] sm:text-sm transition-colors ${
                    isActive
                      ? "font-bold text-gray-900"
                      : isCompleted
                        ? "font-medium text-gray-700"
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line between steps */}
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 min-w-[20px] h-0.5 mx-1 sm:mx-2 -mt-5 sm:-mt-6 transition-colors ${
                    step.id < currentStep ? "bg-[#0055aa]" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
