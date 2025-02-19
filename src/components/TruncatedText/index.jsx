import React, { useState } from "react";

const TruncatedText = ({ text, maxLength = 6 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isTruncated = text.length > maxLength;
  const truncatedText = isTruncated ? `${text.slice(0, maxLength)}...` : text;

  return (
    <th
      className="py-3 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: "pointer", fontWeight: "550" }}
    >
      <span className={isHovered ? "invisible" : "visible"}>{truncatedText}</span>
      {isHovered && (
        <div className="bg-white z-50 whitespace-nowrap min-w-full pb-3">
          {text}
        </div>
      )}
    </th>
  );
};

export default TruncatedText;
