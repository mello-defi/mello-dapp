import React from 'react';

export default function OnboardingStepDescription({
  children,
  whatIsRequired,
  whyIsRequired,
  notes
}: {
  children?: React.ReactNode;
  whatIsRequired?: React.ReactNode;
  whyIsRequired?: React.ReactNode;
  notes?: React.ReactNode;
}) {
  return (
    <>
      {children ? (
        <div>{children}</div>
      ) : (
        <>
          {whatIsRequired && whyIsRequired && (
            <>
              <span className={'font-medium text-body'}>What is required?</span>
              <br />
              <span className={'text-body-smaller'}>{whatIsRequired}</span>
              <br />
              <br />
              <span className={'font-medium text-body'}>Why is this required?</span>
              <br />
              <span className={'text-body-smaller'}>{whyIsRequired}</span>
              {notes && (
                <>
                  <br />
                  <br />
                  <span className={'italic'}>Notes: {notes}</span>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
