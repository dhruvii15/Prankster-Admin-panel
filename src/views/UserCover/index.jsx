import React, { useEffect, useState } from 'react';
import { Button, Table, Pagination, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';

// img
import logo from "../../assets/images/logo.svg";

const UserCover = () => {
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [category, setCategory] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState({});

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/users/read', { TypeId: "4" })
            .then((res) => {
                const newData = res.data.data.reverse();
                setFilteredData(newData); // Set filtered data initially to all data
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data.");
            });
    };


    const getCategory = () => {
        axios.post('https://pslink.world/api/cover/subcategory/read')
            .then((res) => {
                setCategory(res.data.data);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch category.");
            });
    };

    useEffect(() => {
        getData();
        getCategory();
    }, []);

    const handleCategoryChange = (coverId, categoryId) => {
        setSelectedCategories(prev => ({
            ...prev,
            [coverId]: categoryId
        }));
    };

    const handlePlusClick = (cover) => {
        const selectedCategory = selectedCategories[cover._id];

        if (!selectedCategory) {
            toast.error("Please select a category first");
            return;
        }

        const formData = new FormData();
        formData.append('Category', 'realistic');
        formData.append('CoverURL', cover.CoverURL);
        formData.append('CoverName', cover.CoverName);
        formData.append('CoverPremium', false);
        formData.append('Hide', false);
        formData.append('role', cover._id);
        formData.append('SubCategory', selectedCategory);



        if (window.confirm("Are you sure you want to move this Cover Image?")) {
            axios.post('http://localhost:5000/api/cover/create', formData)
                .then((res) => {
                    getData();
                    toast.success(res.data.message);
                    // Clear the selected category after successful submission
                    setSelectedCategories(prev => {
                        const newState = { ...prev };
                        delete newState[cover._id];
                        return newState;
                    });
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

        // Add pagination items
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
    

    if (loading) return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: "hidden"
            }}
        >
            <img src={logo} alt='loading....' style={{
                animation: "1.2s ease-out infinite zoom-in-zoom-out2",
                width: "200px"
            }} />
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center pb-5'>
                <div>
                    <h4>Cover </h4>
                    <p>User / Cover Management</p>
                </div>
            </div>

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Cover Image</th>
                        <th>Cover Name</th>
                        <th>SubCategory</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((cover, index) => (
                            <tr key={cover._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>
                                    <img src={cover.CoverURL} alt="cover thumbnail" style={{ width: '100px', height: '100px' }} />
                                </td>
                                <td>{cover.CoverName}</td>
                                <td>
                                    <Form.Control
                                    as="select"
                                        value={selectedCategories[cover._id] || ""}
                                        onChange={(e) => handleCategoryChange(cover._id, e.target.value)}
                                        className='mx-auto'
                                        style={{width:"210px"}}
                                    >
                                        <option value="">Select a subcategory</option>
                                        {category.map((cat) => {
                                                return (
                                                    <option key={cat._id} value={cat.SubCategory}>
                                                        {cat.SubCategory}
                                                    </option>
                                                );
                                        })}
                                    </Form.Control>
                                </td>
                                <td>
                                    <Button
                                        className='bg-transparent border-0 fs-4'
                                        style={{ color: "#0385C3" }}
                                        onClick={() => handlePlusClick(cover)}
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                    </Button>
                                    <Button className='bg-transparent border-0 text-danger fs-5' onClick={() => handleDelete(cover._id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-center">No Data Found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {totalPages > 1 && (
                <div className='d-flex justify-content-center'>
                    <Pagination>
                        {renderPaginationItems()}
                    </Pagination>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default UserCover;