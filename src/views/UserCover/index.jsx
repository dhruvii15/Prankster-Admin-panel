import React, { useEffect, useState } from 'react';
import { Button, Table, Pagination, Form, Modal, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserCover = () => {
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [category, setCategory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedCover, setSelectedCover] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customTagName, setCustomTagName] = useState('');
    
    const itemsPerPage = 15;

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/users/read', { TypeId: "4" })
            .then((res) => {
                setFilteredData(res.data.data.reverse());
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch data.");
                setLoading(false);
            });
    };

    const getCategory = () => {
        axios.post('https://pslink.world/api/cover/TagName/read')
            .then((res) => {
                setCategory(res.data.data);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch Tag Name.");
            });
    };

    useEffect(() => {
        getData();
        getCategory();
    }, []);

    const handleCheckClick = (cover) => {
        setSelectedCover(cover);
        setSelectedTags([]);
        setShowModal(true);
    };

    const handleTagSelect = (tag) => {
        if (selectedTags.length < 5 && !selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const removeTag = (tagToRemove) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    const handleCustomTagAdd = () => {
        if (customTagName.trim() && selectedTags.length < 5 && !selectedTags.includes(customTagName.trim())) {
            setSelectedTags([...selectedTags, customTagName.trim()]);
            setCustomTagName('');
            setShowCustomInput(false);
        }
    };

    const handleSubmit = () => {
        if (selectedTags.length === 0) {
            toast.error("Please select at least one tag");
            return;
        }

        const formData = new FormData();
        formData.append('Category', 'realistic');
        formData.append('CoverURL', selectedCover.CoverURL);
        formData.append('CoverName', selectedCover.CoverName);
        formData.append('CoverPremium', false);
        formData.append('Hide', false);
        formData.append('role', selectedCover._id);
        formData.append('TagName', JSON.stringify(selectedTags));

        if (window.confirm("Are you sure you want to move this Cover Image?")) {
            axios.post('https://pslink.world/api/cover/create', formData)
                .then((res) => {
                    getData();
                    toast.success(res.data.message);
                    setShowModal(false);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("An error occurred. Please try again.");
                });
        }
    };

    const handleDelete = (coverId) => {
        if (window.confirm("Are you sure you want to delete this Cover Image?")) {
            axios.delete(`https://pslink.world/api/users/delete/${coverId}?TypeId=4`)
                .then((res) => {
                    getData();
                    toast.success(res.data.message);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("An error occurred. Please try again.");
                });
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPaginationItems = () => {
        let items = [];
        const totalPagesToShow = 4;
        let startPage = Math.max(1, currentPage - Math.floor(totalPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + totalPagesToShow - 1);

        if (endPage - startPage < totalPagesToShow - 1) {
            startPage = Math.max(1, endPage - totalPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => paginate(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }
        return items;
    };

    if (loading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="d-sm-flex justify-content-between align-items-center pb-5">
                <div>
                    <h4>Cover</h4>
                    <p>User / Cover Management</p>
                </div>
            </div>

            <Table striped bordered hover responsive className="text-center fs-6">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Cover Image</th>
                        <th>Cover Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((cover, index) => (
                            <tr key={cover._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>
                                    <img src={cover.CoverURL} alt="cover thumbnail" className="w-24 h-24" />
                                </td>
                                <td>{cover.CoverName}</td>
                                <td>
                                    <Button
                                        className="bg-transparent border-0 fs-4"
                                        style={{ color: "#0385C3" }}
                                        onClick={() => handleCheckClick(cover)}
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                    </Button>
                                    <Button 
                                        className="bg-transparent border-0 text-danger fs-5"
                                        onClick={() => handleDelete(cover._id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="text-center">No Data Found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center">
                    <Pagination>{renderPaginationItems()}</Pagination>
                </div>
            )}

            <Modal centered show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Select Tags</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                            Searching Tags
                            <span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>*</span>
                        </Form.Label>

                        <div className="mb-2 d-flex flex-wrap gap-2">
                            {selectedTags.map((tag, index) => (
                                <div key={index} className="p-2 rounded d-flex align-items-center" style={{ border: "1px solid #c1c1c1" }}>
                                    <span>{tag}</span>
                                    <Button
                                        variant="link"
                                        className="p-0 ms-2"
                                        onClick={() => removeTag(tag)}
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="text-danger" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {!showCustomInput && (
                            <div className="mb-2">
                                <Form.Control
                                    as="select"
                                    className="py-2"
                                    onChange={(e) => handleTagSelect(e.target.value)}
                                    value=""
                                    disabled={selectedTags.length >= 5}
                                >
                                    <option value="">Select a TagName</option>
                                    {category.map((cat, index) => (
                                        <option
                                            key={index}
                                            value={cat}
                                            disabled={selectedTags.includes(cat)}
                                        >
                                            {cat}
                                        </option>
                                    ))}
                                </Form.Control>
                            </div>
                        )}

                        {showCustomInput ? (
                            <div className="d-flex gap-2 mb-2">
                                <Form.Control
                                    type="text"
                                    value={customTagName}
                                    onChange={(e) => setCustomTagName(e.target.value)}
                                    placeholder="Enter custom TagName"
                                    className="py-2"
                                />
                                <Button
                                    onClick={handleCustomTagAdd}
                                    disabled={!customTagName.trim() || selectedTags.length >= 5}
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
                                disabled={selectedTags.length >= 5}
                                className="p-0"
                            >
                                <FontAwesomeIcon icon={faPlus} className="me-1" />
                                Add Custom TagName
                            </Button>
                        )}
                    </Form.Group>
                    <Row className="mt-2">
                            <Col xs={6}>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowModal(false)}
                                    className='w-100 rounded-3 text-black'
                                    style={{ background: "#F6F7FB" }}
                                >
                                    Cancel
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className='submit border-0 rounded-3 w-100'
                                >
                                    Submit
                                </Button>
                            </Col>
                        </Row>
                </Modal.Body>
            </Modal>

            <ToastContainer />
        </div>
    );
};

export default UserCover;