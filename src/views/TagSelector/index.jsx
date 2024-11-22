import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

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
  return (
    <Form.Group className="mb-4">
      <Form.Label className="fw-bold">
        Searching Tags
        <span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>
          *{" "}
        </span>
      </Form.Label>

      {/* Selected Tags */}
      <div className="mb-2 d-flex flex-wrap gap-2">
        {selectedTags.map((tag, index) => (
          <div
            key={index}
            className="p-2 rounded d-flex align-items-center"
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

      {/* Available Tags as Labels */}
      {!showCustomInput && (
        <div className="mb-3 d-flex flex-wrap gap-2">
          {availableTags.map((tag, index) => (
            <Button
              key={index}
              onClick={() => onTagSelect(tag)}
              disabled={selectedTags.includes(tag) || selectedTags.length >= maxTags}
              className="py-1 px-2"
              style={{
                backgroundColor: selectedTags.includes(tag) ? '#e9ecef' : '#f8f9fa',
                border: '1px solid #dee2e6',
                color: selectedTags.includes(tag) ? '#6c757d' : '#212529',
                cursor: selectedTags.includes(tag) ? 'default' : 'pointer'
              }}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}

      {/* Custom Tag Input */}
      {showCustomInput ? (
        <div className="d-flex gap-2 mb-2">
          <Form.Control
            type="text"
            value={customTagName}
            onChange={(e) => setCustomTagName(e.target.value)}
            placeholder="Enter custom tag name"
            className="py-2"
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
      ) : (
        <Button
          variant="link"
          onClick={() => setShowCustomInput(true)}
          disabled={selectedTags.length >= maxTags}
          className="p-0"
        >
          <FontAwesomeIcon icon={faPlus} className="me-1" />
          Add Custom Tag Name
        </Button>
      )}

      {touched && errors && (
        <div className="text-danger mt-1">
          {errors}
        </div>
      )}
    </Form.Group>
  );
};

export default TagSelector;