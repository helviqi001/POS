import React, { useState } from 'react';

const TruncatedInformation = ({ text }) => {
  const [isFullTextShown, setIsFullTextShown] = useState(false);

  const toggleFullText = () => {
    setIsFullTextShown(!isFullTextShown);
  };

  const toggleHideText = () => {
    setIsFullTextShown(false);
  };


  return (
    <>
      <div style={{ whiteSpace: 'pre-line' }}>
        {text.length <= 50 ? text : isFullTextShown ? (
          <span>
            {text}{' '}
            <button style={{ cursor: 'pointer', color: 'blue',background: 'none', border: 'none' }} onClick={toggleHideText}>
              (hide)
            </button>
          </span>
        ) : (
          <span>
            {`${text.slice(0, 50)}... `}
            <button style={{ cursor: 'pointer', color: 'blue',background: 'none', border: 'none' }} onClick={toggleFullText}>
              (more)
            </button>
          </span>
        )}
      </div>
    </>
  );
};

export default TruncatedInformation;
