import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

const TagSelector = ({
  availableTags,
  selectedTags,
  onTagSelect,
  onTagRemove,
  showCustomInput,
  setShowCustomInput,
  customTagName,
  setCustomTagName,
  handleCustomTagAdd,
  maxTags = 5,
  touched,
  errors
}) => {

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const visibleTags = isExpanded ? availableTags : availableTags.slice(0, 5);
  const totalTags = availableTags.length;

  return (
    <Form.Group className="mb-4">
      <Form.Label className="fw-bold">
        Searching Tags
        <span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>*</span>
      </Form.Label>

      
      
      {/* Selected Tags */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        {selectedTags.map((tag, index) => (
          <div
            key={index}
            className="px-2 rounded d-flex align-items-center"
            style={{ border: "1px solid #c1c1c1" }}
          >
            <span>{tag}</span>
            <Button
              variant="link"
              className="p-0 ms-2"
              onClick={() => onTagRemove(tag)}
            >
              <FontAwesomeIcon icon={faTimes} className="text-danger" />
            </Button>
          </div>
        ))}
      </div>

      <div className="d-flex gap-2 mb-4">
          <Form.Control
            type="text"
            value={customTagName}
            onChange={(e) => setCustomTagName(e.target.value)}
            placeholder="Enter custom tag name"
          />
          <Button
            onClick={handleCustomTagAdd}
            disabled={!customTagName.trim() || selectedTags.length >= maxTags}
            style={{ backgroundColor: "#F9E238", color: "black" }}
            className="border-0 rounded-2"
          >
            Add
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setShowCustomInput(false);
              setCustomTagName('');
            }}
            className="border-0 rounded-2"
          >
            Cancel
          </Button>
        </div>

      {/* Available Tags as Labels */}
      {!showCustomInput && (
        <div
          style={{
            width: "100%",
            maxHeight: "120px",
            overflowY: "auto",
          }}
        >
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {visibleTags.map((tag, index) => (
              <Button
                key={index}
                onClick={() => onTagSelect(tag)}
                disabled={selectedTags.includes(tag) || selectedTags.length >= maxTags}
                className="py-1 px-2 rounded-2"
                style={{
                  backgroundColor: selectedTags.includes(tag) ? "#e9ecef" : "#f8f9fa",
                  border: "1px solid #dee2e6",
                  color: selectedTags.includes(tag) ? "#6c757d" : "#212529",
                  cursor: selectedTags.includes(tag) ? "default" : "pointer",
                  fontSize:"13px"
                }}
              >
                {tag}
              </Button>
            ))}

            {totalTags > 5 && !isExpanded && (
              <span
                style={{ marginLeft: "8px", fontWeight: "bold", cursor: "pointer" }}
                onClick={toggleExpand}
                className='border px-2 py-1 rounded-2'
              >
                + {totalTags - 5}
              </span>
            )}

            {totalTags > 5 && (
              <Button
                onClick={toggleExpand}
                className="py-1 px-2 ms-auto"
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#212529",
                }}
              >
                {isExpanded ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}
              </Button>
            )}
          </div>

          {isExpanded && (
            <div
              style={{
                maxHeight: "120px",
                overflowY: "auto",
                marginTop: "8px",
              }}
            >
            </div>
          )}
        </div>
      )}


      
    </Form.Group>
  );
};

export default TagSelector;