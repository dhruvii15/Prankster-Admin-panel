import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination, Nav, Spinner, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff, faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from "../../assets/images/logo.svg";
import TagSelector from 'views/TagSelector';

const CoverURL = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [fileLabel, setFileLabel] = useState('Cover Image Upload');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('emoji');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const [selectedFilter, setSelectedFilter] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [TagName, setTagName] = useState([]);
    const [customTagName, setCustomTagName] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    console.log(previewUrl);



    const renderPaginationItems = () => {
        const totalPages = Math.ceil(filterData(data).length / itemsPerPage);
        const totalPagesToShow = 4;
        let startPage = Math.max(1, currentPage - Math.floor(totalPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + totalPagesToShow - 1);
        const items = [];

        if (endPage - startPage < totalPagesToShow - 1) {
            startPage = Math.max(1, endPage - totalPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        return items;
    };

    const toggleModal = (mode) => {
        if (!isSubmitting) {
            if (mode === 'add') {
                setId(undefined);
                setIsEditing(false);
                setFileLabel('Cover Image Upload');
                setSelectedFile(null);
                setPreviewUrl(null);
            }
            setVisible(!visible);
            // Fetch subcategories when modal opens
            if (!visible) {
                getTagName();
            }
        }
    };

    useEffect(() => {
        if (!visible) {
            formik.resetForm();
            setSelectedFile(null);
            setPreviewUrl(null);
            setCurrentImage(null);
            setFileLabel('Cover Image Upload');
            setIsEditing(false);
        }
    }, [visible]);

    const handleFileChange = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            formik.setFieldValue("CoverURL", file);
            setSelectedFile(file);
            setFileLabel('Cover Image Uploaded'); // Update to show the file name

            // Create preview URL for the new file
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/cover/read')
            .then((res) => {
                const reversedData = res.data.data.reverse();
                setData(reversedData);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data.");
            });
    };

    const getTagName = () => {
        axios.post('https://pslink.world/api/cover/TagName/read')
            .then((res) => {
                setTagName(res.data.data);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch TagName.");
            });
    };

    useEffect(() => {
        getData();
        getTagName();
    }, []);

    const filterData = (covers) => {
        const categoryData = covers.filter(cover => cover.Category === activeTab);

        switch (selectedFilter) {
            case "Hide":
                return categoryData.filter(cover => cover.Hide === true);
            case "Unhide":
                return categoryData.filter(cover => cover.Hide === false);
            case "Premium":
                return categoryData.filter(cover => cover.CoverPremium === true);
            case "Free":
                return categoryData.filter(cover => cover.CoverPremium === false);
            default:
                return categoryData;
        }
    };

    const getTabCount = (category) => {
        const categoryData = data.filter(cover => cover.Category === category);

        switch (selectedFilter) {
            case "Hide":
                return categoryData.filter(cover => cover.Hide === true).length;
            case "Unhide":
                return categoryData.filter(cover => cover.Hide === false).length;
            case "Premium":
                return categoryData.filter(cover => cover.CoverPremium === true).length;
            case "Free":
                return categoryData.filter(cover => cover.CoverPremium === false).length;
            default:
                return categoryData.length;
        }
    };

    const handleTabSelect = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const coverSchema = Yup.object().shape({
        Category: Yup.string().required('Category is required'),
        TagName: Yup.array()
            .min(1, 'At least one TagName is required')
            .max(7, 'Maximum 7 SubCategories allowed')
            .required('At least one TagName is required'),
        CoverName: Yup.string().required('CoverName is required'),
        CoverURL: Yup.mixed()
            .test('fileRequired', 'Cover Image is required', function (value) {
                if (isEditing && !value && currentImage) return true;
                return value instanceof File;
                // })
                // .test('fileDimensions', 'Image dimensions must be 1070 x 950 pixels', function (value) {
                //     return new Promise((resolve) => {
                //         if (!value) return resolve(true); // No file provided, skip dimension check
                //         const reader = new FileReader();
                //         reader.onload = (e) => {
                //             const img = new Image();
                //             img.onload = () => {
                //                 resolve(img.width === 1070 && img.height === 950);
                //             };
                //             img.onerror = () => resolve(false);
                //             img.src = e.target.result;
                //         };
                //         reader.readAsDataURL(value);
                //     });
            }),
        CoverPremium: Yup.boolean(),
        Hide: Yup.boolean(),
    });


    const formik = useFormik({
        initialValues: {
            Category: '',
            TagName: [],
            CoverName: '',
            CoverURL: '',
            CoverPremium: false,
            Hide: false,
            isEditing: false,
        },
        validationSchema: coverSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setIsSubmitting(true);
                const formData = new FormData();

                // Only append file if it exists (new upload or update with new file)
                if (selectedFile) {
                    formData.append('CoverURL', selectedFile);
                }

                formData.append('Category', values.Category);
                formData.append('TagName', JSON.stringify(values.TagName));
                formData.append('CoverName', values.CoverName);
                formData.append('CoverPremium', values.CoverPremium);
                formData.append('Hide', values.Hide);

                let response;
                if (isEditing) {
                    response = await axios.patch(
                        `https://pslink.world/api/cover/update/${id}`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );
                } else {
                    response = await axios.post(
                        'https://pslink.world/api/cover/create',
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );
                }

                toast.success(response.data.message);
                resetForm();
                setCustomTagName('');
                setShowCustomInput(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                setId(undefined);
                setIsEditing(false);
                setFileLabel('Cover Image Upload');
                getData();
                toggleModal();
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || "An error occurred. Please try again.");
            } finally {
                setIsSubmitting(false);
                setSubmitting(false);
            }
        },
    });

    const handleDelete = (coverId) => {
        if (window.confirm("Are you sure you want to delete this Cover Image?")) {
            axios.delete(`https://pslink.world/api/cover/delete/${coverId}`)
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

    const handleTagNameSelect = (TagName) => {
        if (formik.values.TagName.length < 7) {
            const updatedTagName = [...formik.values.TagName];
            if (!updatedTagName.includes(TagName)) {
                updatedTagName.push(TagName);
                formik.setFieldValue('TagName', updatedTagName);
            }
        } else {
            toast.error('Maximum 7 TagName allowed');
        }
    };

    const handleCustomTagNameAdd = () => {
        if (customTagName.trim() === '') {
            return;
        }

        if (formik.values.TagName.length < 7) {
            const updatedTagName = [...formik.values.TagName];
            if (!updatedTagName.includes(customTagName.trim())) {
                updatedTagName.push(customTagName.trim());
                formik.setFieldValue('TagName', updatedTagName);
                setCustomTagName('');
                setShowCustomInput(false);
            } else {
                toast.error('TagName already exists');
            }
        } else {
            toast.error('Maximum 7 TagName allowed');
        }
    };


    const removeTagName = (TagName) => {
        const updatedTagName = formik.values.TagName.filter(
            (item) => item !== TagName
        );
        formik.setFieldValue('TagName', updatedTagName);
    };

    const handleEdit = (cover) => {
        const subCategories = Array.isArray(cover.TagName)
            ? cover.TagName
            : cover.TagName ? [cover.TagName] : [];

        formik.setValues({
            Category: cover.Category || '',
            TagName: subCategories,
            CoverName: cover.CoverName || '',
            CoverURL: '', // Clear the file input
            CoverPremium: cover.CoverPremium || false,
            Hide: cover.Hide || false,
            isEditing: true,
        });

        setIsEditing(true);
        setId(cover._id);
        setFileLabel('Current Cover Image');
        setCurrentImage(cover.CoverURL); // Set the current image URL
        toggleModal('edit');
    };

    const handlePremiumToggle = (coverId, currentPremiumStatus) => {
        axios.patch(`https://pslink.world/api/cover/update/${coverId}`, { CoverPremium: !currentPremiumStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleHideToggle = (coverId, currentHideStatus) => {
        axios.patch(`https://pslink.world/api/cover/update/${coverId}`, { Hide: !currentHideStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: "hidden" }}>
                <img src={logo} alt='loading....' style={{ animation: "1.2s ease-out infinite zoom-in-zoom-out2", width: "200px" }} />
            </div>
        );
    }

    const filteredItems = filterData(data);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Cover Image</h4>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center">
                <Button
                    onClick={() => toggleModal('add')}
                    className='my-4 rounded-3 border-0'
                    style={{ backgroundColor: "#F9E238" }}
                >
                    Add CoverImage
                </Button>
                <Form.Select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    style={{ width: 'auto' }}
                    className='my-4'
                >
                    <option value="">All</option>
                    <option value="Hide">Hide</option>
                    <option value="Unhide">Unhide</option>
                    <option value="Premium">Premium</option>
                    <option value="Free">Free</option>
                </Form.Select>
            </div>

            <Nav variant="tabs" className="mt-3">
                <Nav.Item>
                    <Nav.Link
                        active={activeTab === 'emoji'}
                        onClick={() => handleTabSelect('emoji')}
                        className={activeTab === 'emoji' ? 'active-tab' : ''}
                    >
                        Emoji & Gift Cover Image ({getTabCount('emoji')})
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        active={activeTab === 'realistic'}
                        onClick={() => handleTabSelect('realistic')}
                        className={activeTab === 'realistic' ? 'active-tab' : ''}
                    >
                        Realistic Cover Image ({getTabCount('realistic')})
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Cover Image</th>
                        <th>TagName</th>
                        <th>CoverName</th>
                        <th>Premium</th>
                        <th>Hidden</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((cover, index) => (
                            <tr key={cover._id}>
                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                <td>
                                    <img
                                        src={cover.CoverURL || 'placeholder.jpg'} // Default fallback image
                                        alt="CoverImage"
                                        style={{ width: '150px', height: '120px', objectFit: 'cover' }}
                                    />
                                </td>
                                <td>
                                    {cover.TagName?.filter(Boolean).slice(0, 7).join(', ') || 'No Tags'} {/* Fallback text */}
                                </td>
                                <td>{cover.CoverName || 'No Name'}</td>
                                <td>
                                    <Button
                                        className="bg-transparent border-0 fs-4"
                                        style={{ color: cover.CoverPremium ? "#0385C3" : "#6c757d" }}
                                        onClick={() => handlePremiumToggle(cover._id, cover.CoverPremium)}
                                    >
                                        <FontAwesomeIcon
                                            icon={cover.CoverPremium ? faToggleOn : faToggleOff}
                                            title={cover.CoverPremium ? "Premium ON" : "Premium OFF"}
                                        />
                                    </Button>
                                </td>
                                <td>
                                    <Button
                                        className="bg-transparent border-0 fs-5"
                                        style={{ color: "#0385C3" }}
                                        onClick={() => handleHideToggle(cover._id, cover.Hide)}
                                    >
                                        <FontAwesomeIcon
                                            icon={cover.Hide ? faEyeSlash : faEye}
                                            title={cover.Hide ? "Hidden" : "Visible"}
                                        />
                                    </Button>
                                </td>
                                <td>
                                    <Button
                                        className="edit-dlt-btn"
                                        style={{ color: "#0385C3" }}
                                        onClick={() => handleEdit(cover)}
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button
                                        className="edit-dlt-btn text-danger"
                                        onClick={() => handleDelete(cover._id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="text-center">No Data Found</td>
                        </tr>
                    )}

                </tbody>
            </Table>

            {Math.ceil(filteredItems.length / itemsPerPage) > 1 && (
                <div className='d-flex justify-content-center'>
                    <Pagination>
                        {renderPaginationItems()}
                    </Pagination>
                </div>
            )}

            <Modal
                show={visible}
                onHide={() => !isSubmitting && toggleModal()}
                centered
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header>
                    <Modal.Title>{isEditing ? "Edit Cover Image" : "Add Cover Image"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group className="mb-4">
                            <Form.Label className='fw-bold'>Category<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                as="select"
                                id="Category"
                                name="Category"
                                className='py-2'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.Category}
                                isInvalid={formik.touched.Category && !!formik.errors.Category}
                            >
                                <option value="">Select Category</option>
                                <option value="emoji">Emoji & Gift Cover Image</option>
                                <option value="realistic">Realistic Cover Image</option>
                            </Form.Control>
                            {formik.errors.Category && formik.touched.Category && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Category}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Cover Name ( use searching )<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                type="text"
                                id="CoverName"
                                name="CoverName"
                                className='py-2'
                                placeholder="Enter CoverName"
                                value={formik.values.CoverName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.CoverName && !!formik.errors.CoverName}
                            />
                            {formik.errors.CoverName && formik.touched.CoverName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CoverName}
                                </div>
                            )}
                        </Form.Group>

                        <hr className='bg-black' />
                        <Form.Group className="mb-4">
                            <TagSelector
                                availableTags={TagName}
                                selectedTags={formik.values.TagName}
                                onTagSelect={handleTagNameSelect}
                                onTagRemove={removeTagName}
                                showCustomInput={showCustomInput}
                                setShowCustomInput={setShowCustomInput}
                                customTagName={customTagName}
                                setCustomTagName={setCustomTagName}
                                handleCustomTagAdd={handleCustomTagNameAdd}
                                touched={formik.touched.TagName}
                                errors={formik.errors.TagName}
                            />

                            {formik.errors.TagName && formik.touched.TagName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.TagName}
                                </div>
                            )}
                        </Form.Group>
                        <hr className='bg-black' />

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>{fileLabel} <span style={{ fontSize: "12px" }}></span>
                                <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span>
                            </Form.Label>
                            <div className="d-flex flex-column">
                                <div className="d-flex align-items-center">
                                    <Form.Control
                                        type="file"
                                        id="CoverURL"
                                        name="CoverURL"
                                        onChange={handleFileChange}
                                        onBlur={formik.handleBlur}
                                        className="d-none"
                                        accept="image/*"
                                    />
                                    <label
                                        htmlFor="CoverURL"
                                        className="btn mb-0 p-4 bg-white w-100 rounded-2 position-relative"
                                        style={{ border: "1px dotted #c1c1c1" }}
                                    >
                                        <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ fontSize: "15px" }} />
                                        <div className="d-flex flex-column align-items-center gap-1">
                                            <span style={{ color: "#c1c1c1" }}>
                                                {isEditing ? "Select New Image" : "Select Image"}
                                            </span>
                                            {selectedFile && (
                                                <span style={{ fontSize: "0.8rem", color: "#5E95FE" }}>
                                                    {selectedFile.name}
                                                </span>
                                            )}
                                        </div>
                                    </label>
                                </div>

                                {/* Image Preview */}
                                {/* {(currentImage || selectedFile) && (
                                    <div className="mt-3 text-center">
                                        <img
                                            src={selectedFile ? URL.createObjectURL(selectedFile) : currentImage}
                                            alt="Cover Preview"
                                            style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'contain' }}
                                        />
                                    </div>
                                )} */}

                                {formik.touched.CoverURL && formik.errors.CoverURL && (
                                    <div className="invalid-feedback d-block">
                                        {formik.errors.CoverURL}
                                    </div>
                                )}
                            </div>
                        </Form.Group>


                        <div className='d-flex flex-wrap gap-sm-4'>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="CoverPremium"
                                    name="CoverPremium"
                                    label="Premium Cover"
                                    checked={formik.values.CoverPremium}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="Hide"
                                    name="Hide"
                                    label="Hide Cover"
                                    checked={formik.values.Hide}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>

                        </div>

                        <Row className="mt-2">
                            <Col xs={6}>
                                <Button
                                    variant="secondary"
                                    onClick={() => toggleModal()}
                                    disabled={isSubmitting}
                                    className='w-100 rounded-3 text-black'
                                    style={{ background: "#F6F7FB" }}
                                >
                                    Cancel
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button
                                    type="submit"
                                    className='submit border-0 rounded-3 w-100'
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Spinner size='sm' /> : (isEditing ? 'Update' : 'Submit')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>

            <ToastContainer />
        </div>
    );

};
export default CoverURL;