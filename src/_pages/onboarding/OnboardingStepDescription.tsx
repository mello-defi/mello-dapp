import React from 'react';
import { OnboardingStep } from '_pages/onboarding/OnboardingSteps';

export default function OnboardingStepDescription({ step }: { step: OnboardingStep }) {
  return (
    <>
      {step.description.text ? (
        <span dangerouslySetInnerHTML={{ __html: step.description.text }} />
      ) : (
        <>
          {step.description.whatIsRequired && step.description.whyIsRequired && (
            <>
              <span className={'font-bold text-body'}>What is required?</span>
              <br />
              <span
                className={'text-body-smaller'}
                dangerouslySetInnerHTML={{ __html: step.description.whatIsRequired }}
              />
              <br />
              <br />
              <span className={'font-bold text-body'}>Why is this required?</span>
              <br />
              <span
                className={'text-body-smaller'}
                dangerouslySetInnerHTML={{ __html: step.description.whyIsRequired }}
              />
              {step.description.notes && (
                <>
                  <br />
                  <br />
                  <span className={'italic'}>
                    Notes: <span dangerouslySetInnerHTML={{ __html: step.description.notes }} />
                  </span>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
