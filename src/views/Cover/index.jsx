import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination, Spinner, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff, faArrowUpFromBracket, faArrowTrendUp, faArrowTrendDown, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faCopy, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from "../../assets/images/logo.svg";
import TagSelector from 'views/TagSelector';
import ImagePreviewModal from 'components/ImagePreviewModal';

const CoverURL = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [fileLabel, setFileLabel] = useState('Cover Image Upload');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [TagName, setTagName] = useState([]);
    const [customTagName, setCustomTagName] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [currentFileName, setCurrentFileName] = useState('');
    const [currentImage, setCurrentImage] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [isOn, setIsOn] = useState(false);
    const [isSubmitting2, setIsSubmitting2] = useState(false);
    const [adminId, setAdminId] = useState(null);
    const [inputType, setInputType] = useState('file'); // 'file' or 'text'
    const [coverUrlText, setCoverUrlText] = useState('');
    // const [safetyFilter, setSafetyFilter] = useState("");
    const [premiumFilter, setPremiumFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState('');

    console.log(previewUrl);

    const inputTypes = [
        { id: 'file', label: 'File Upload' },
        { id: 'text', label: 'URL' }
    ];


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
                setCurrentFileName('');
            }
            setVisible(!visible);
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
            setCurrentFileName('');
        }
    }, [visible]);

    const handleFileChange = async (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            try {
                // Check if file is a GIF
                const isGif = file.type === 'image/gif';

                let processedFile;
                if (isGif) {
                    // For GIFs, check size directly without compression
                    if (file.size > 5 * 1024 * 1024) {
                        toast.error('GIF file size must be under 5MB');
                        return;
                    }
                    processedFile = file;
                } else {
                    // For other image types, compress them
                    processedFile = await compressImage(file);
                    if (processedFile.size > 5 * 1024 * 1024) {
                        toast.error('Compressed file still exceeds 5MB limit');
                        return;
                    }
                }

                // Update Formik field and file state
                formik.setFieldValue("CoverURL", processedFile);
                setSelectedFile(processedFile);
                setFileLabel(processedFile.name);
                setPreviewUrl(URL.createObjectURL(processedFile));
            } catch (error) {
                toast.error('Error processing image');
                console.error(error);
            }
        }
    };

    // Image compression function (only for non-GIF images)
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            if (file.type === 'image/gif') {
                resolve(file); // Return GIF as-is
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Reduce image quality and size
                    const maxWidth = 1920;
                    const maxHeight = 1080;
                    let width = img.width;
                    let height = img.height;

                    // Scale down if larger than max dimensions
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob with reduced quality
                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.7); // 0.7 quality (70%)
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const getData = () => {
        setLoading(true);
        axios.post('http://localhost:5001/api/cover/read')
            .then((res) => {
                const reversedData = res.data.data;
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
        axios.post('http://localhost:5001/api/cover/TagName/read')
            .then((res) => {
                setTagName(res.data.data);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch TagName.");
            });
    };

    const getAdminData = () => {
        axios.get('http://localhost:5001/api/admin/read')
            .then((res) => {
                setIsOn(res.data.data[0].CoverSafe);
                setAdminId(res.data.data[0]._id);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch admin data.");
            });
    };

    useEffect(() => {
        getData();
        getTagName();
        getAdminData();
    }, []);

    const getGlobalIndex = (localIndex) => {
        return (currentPage - 1) * itemsPerPage + localIndex;
    };

    // Get the page number from global index
    const getPageFromIndex = (globalIndex) => {
        return Math.floor(globalIndex / itemsPerPage) + 1;
    };

    // Handle navigation in the preview modal
    const handlePreviewNavigation = (newGlobalIndex) => {
        const filteredData = filterData(data);
        if (newGlobalIndex >= 0 && newGlobalIndex < filteredData.length) {
            // Calculate the new page number
            const newPage = getPageFromIndex(newGlobalIndex);

            // Update the current page if necessary
            if (newPage !== currentPage) {
                setCurrentPage(newPage);
            }

            // Update the preview index
            setPreviewIndex(newGlobalIndex);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filterData = (covers) => {
        // First filter by unsafe status based on isOn state
        let filteredData = covers.filter(cover => cover.Safe === isOn);

        // Apply safety filter
        // if (safetyFilter === "Safe") {
        //     filteredData = filteredData.filter(cover => !cover.Hide);
        // } else if (safetyFilter === "Unsafe") {
        //     filteredData = filteredData.filter(cover => cover.Hide);
        // }

        // Apply premium filter
        if (premiumFilter === "Premium") {
            filteredData = filteredData.filter(cover => cover.CoverPremium);
        } else if (premiumFilter === "Free") {
            filteredData = filteredData.filter(cover => !cover.CoverPremium);
        }

        // Apply search filter if search term exists
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filteredData = filteredData.filter(item => {
                // Check if TagName is an array and any tag includes the search term
                if (Array.isArray(item.TagName)) {
                    return item.TagName.some(tag =>
                        tag.toLowerCase().includes(searchLower)
                    );
                }
                // If TagName is a string, check if it includes the search term
                return item.TagName.toLowerCase().includes(searchLower);
            });
        }

        return filteredData;
    };

    const coverSchema = Yup.object().shape({
        TagName: Yup.array()
            .min(1, 'At least one TagName is required')
            .max(7, 'Maximum 7 SubCategories allowed')
            .required('At least one TagName is required'),
        CoverName: Yup.string().required('CoverName is required'),
        CoverURL: Yup.mixed()
            .test('fileOrText', 'Either file upload or URL is required', function (value) {
                if (isEditing && !value && currentImage) return true;
                if (inputType === 'text') return !!coverUrlText;
                return value instanceof File;
            })
            .test(
                'fileType',
                'Only image files are allowed (jpg, png, gif)',
                function (value) {
                    if (inputType === 'text') return true;
                    if (value instanceof File) {
                        const allowedExtensions = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
                        return allowedExtensions.includes(value.type);
                    }
                    return true;
                }
            )
            .test(
                'fileSize',
                'File size must be less than 5MB',
                function (value) {
                    if (inputType === 'text') return true;
                    if (value instanceof File) {
                        return value.size <= 5 * 1024 * 1024;
                    }
                    return true;
                }
            ),
        CoverPremium: Yup.boolean(),
        Hide: Yup.boolean(),
        Safe: Yup.boolean(),
    });

    const formik = useFormik({
        initialValues: {
            TagName: [],
            CoverName: '',
            CoverURL: '',
            CoverPremium: false,
            Hide: false,
            Safe: false,
            isEditing: false,
        },
        validationSchema: coverSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setIsSubmitting(true);
                const formData = new FormData();

                if (inputType === 'file' && selectedFile) {
                    formData.append('CoverURL', selectedFile);
                } else if (inputType === 'text') {
                    formData.append('CoverURL', coverUrlText);
                }

                formData.append('TagName', JSON.stringify(values.TagName));
                formData.append('CoverName', values.CoverName);
                formData.append('CoverPremium', values.CoverPremium);
                formData.append('Hide', values.isEditing ? !values.Safe : values.Safe);
                formData.append('Safe', values.Safe);
                formData.append('inputType', inputType);

                let response;
                if (isEditing) {
                    response = await axios.patch(
                        `http://localhost:5001/api/cover/update/${id}`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );
                } else {
                    response = await axios.post(
                        'http://localhost:5001/api/cover/create',
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
                setCoverUrlText('');
                setId(undefined);
                setIsEditing(false);
                setFileLabel('Cover Image Upload');
                setCurrentFileName('');
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
            axios.delete(`http://localhost:5001/api/cover/delete/${coverId}`)
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
        if (customTagName.trim() === '') return;

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
        // Get filename from URL and set current file info
        const fileName = cover.CoverURL.split('/').pop();
        setCurrentFileName(fileName);
        setFileLabel('Current Cover Image');

        // Determine if the current image is a URL (starts with http/https)
        const isUrl = cover.CoverURL.startsWith('http');
        setInputType(isUrl ? 'text' : 'file');

        // If it's a URL, set the URL text field
        if (isUrl) {
            setCoverUrlText(cover.CoverURL);
        } else {
            setCoverUrlText('');
        }

        // Set form values
        formik.setValues({
            TagName: Array.isArray(cover.TagName)
                ? cover.TagName
                : cover.TagName
                    ? [cover.TagName]
                    : [],
            CoverName: cover.CoverName || '',
            CoverURL: '', // Clear the form field as we're handling the image separately
            CoverPremium: cover.CoverPremium || false,
            Hide: cover.Hide || false,
            Safe: cover.Safe || false,
            isEditing: true,
        });

        // Set other state
        setIsEditing(true);
        setId(cover._id);
        setCurrentImage(cover.CoverURL);
        setSelectedFile(null); // Reset any selected file

        toggleModal('edit');
    };

    const handlePremiumToggle = (coverId, currentPremiumStatus) => {
        axios.patch(`http://localhost:5001/api/cover/update/${coverId}`, { CoverPremium: !currentPremiumStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleSafeToggle = (coverId, currentSafeStatus) => {
        axios.patch(`http://localhost:5001/api/cover/update/${coverId}`, { Safe: !currentSafeStatus, Hide: currentSafeStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleToggle = async () => {
        if (!isSubmitting2) {
            const newState = !isOn;
            try {
                setIsSubmitting2(true);
                setIsOn(newState);

                const apiEndpoint = newState ? 'safe' : 'unsafe';
                const response = await axios.post(`http://localhost:5001/api/${apiEndpoint}/${adminId}`, { type: "4" });

                setCurrentPage(1);
                getData();
                getAdminData();

                toast.success(response.data.message);
            } catch (error) {
                console.error('Error updating safe status:', error);
                toast.error("Failed to update safe status.");
                setIsOn(!newState);
            } finally {
                setIsSubmitting2(false);
            }
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: "hidden" }}>
                <img src={logo} alt='loading....' style={{ animation: "1.2s ease-out infinite zoom-in-zoom-out2", width: "200px" }} />
            </div>
        );
    }

    const handleCopyToClipboard = (cover) => {
        if (cover?.CoverURL) {
            navigator.clipboard.writeText(cover.CoverURL)
                .then(() => {
                    toast.success("Cover URL copied to clipboard!");
                })
                .catch((error) => {
                    console.error("Failed to copy: ", error);
                });
        } else {
            alert("No URL to copy!");
        }
    };

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
                <Form className='d-flex align-items-center gap-3'>
                    <span>Safe : </span>
                    <Form.Check
                        type="switch"
                        id="custom-switch"
                        checked={isOn}
                        onChange={handleToggle}
                        className="custom-switch-lg"
                        style={{ transform: 'scale(1.3)' }}
                        disabled={isSubmitting2}
                    />
                </Form>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
                <Button
                    onClick={() => toggleModal('add')}
                    className='rounded-3 border-0'
                    style={{ backgroundColor: "#F9E238" }}
                >
                    Add CoverImage
                </Button>
                <div className='d-flex gap-3'>
                    {/* <div className='d-flex flex-wrap align-items-center'>
                        <span className='mb-0 fw-bold fs-6 pe-2'>Safe :</span>
                        <Form.Select
                            value={safetyFilter}
                            onChange={(e) => setSafetyFilter(e.target.value)}
                            style={{ width: 'auto' }}
                            className='my-3 bg-white'
                        >
                            <option value="">All</option>
                            <option value="Safe">Safe</option>
                            <option value="Unsafe">Unsafe</option>
                        </Form.Select>
                    </div> */}

                    <div className="search-bar-container my-3">
                        <input
                            type="text"
                            placeholder="Search by Tagname"
                            className="search-input"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <button className="search-button">
                            <span role="img" aria-label="search-icon">
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </span>
                        </button>
                    </div>

                    <div className='d-flex flex-wrap align-items-center'>
                        <span className='mb-0 fw-bold fs-6 pe-2'>Access :</span>
                        <Form.Select
                            value={premiumFilter}
                            onChange={(e) => setPremiumFilter(e.target.value)}
                            style={{ width: 'auto' }}
                            className='my-3 bg-white'
                        >
                            <option value="">All</option>
                            <option value="Premium">Premium</option>
                            <option value="Free">Free</option>
                        </Form.Select>
                    </div>
                </div>
            </div>


            <Table striped bordered hover responsive className='text-center fs-6 mt-4'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>CoverName</th>
                        <th>Cover Image</th>
                        <th>TagName</th>
                        <th>Premium</th>
                        <th>Safe</th>
                        <th>Trending</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((cover, index) => (
                            <tr key={cover._id}>
                                <td style={{
                                    backgroundColor: cover.Hide ? '#ffcccc' : ''
                                }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                <td>{cover.CoverName || 'No Name'}</td>
                                <td>
                                    <button
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => {
                                            setPreviewIndex(getGlobalIndex(index));
                                            setShowPreview(true);
                                        }}
                                    >
                                        <img
                                            src={cover.CoverURL || 'placeholder.jpg'}
                                            alt="CoverImage"
                                            style={{
                                                width: '150px',
                                                height: '120px',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </button>
                                </td>

                                <td>
                                    {cover.TagName?.filter(Boolean).slice(0, 7).join(', ') || 'No Tags'}
                                </td>
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
                                        onClick={() => handleSafeToggle(cover._id, cover.Safe)}
                                    >
                                        <FontAwesomeIcon
                                            icon={cover.Safe ? faEyeSlash : faEye}
                                            title={cover.Safe ? "Hidden" : "Visible"}
                                        />
                                    </Button>
                                </td>
                                <td>
                                    <FontAwesomeIcon
                                        icon={cover.trending ? faArrowTrendUp : faArrowTrendDown}
                                        title={cover.trending ? "up" : "down"}
                                        className='fs-5'
                                        style={{ color: cover.trending ? 'green' : 'red' }}
                                    />
                                </td>
                                <td>
                                    <Button
                                        className="edit-dlt-btn text-black"
                                        onClick={() => handleCopyToClipboard(cover)}
                                    >
                                        <FontAwesomeIcon icon={faCopy} />
                                    </Button>

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
                            <td colSpan={8} className="text-center">No Data Found</td>
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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                            <Form.Label className='fw-bold'>
                                Cover Image Type
                                <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>*</span>
                            </Form.Label>
                            <div className="d-flex gap-3 mb-3">
                                {inputTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => !isSubmitting && setInputType(type.id)}
                                        className={`cursor-pointer px-3 py-1 rounded-3 ${inputType === type.id ? 'bg-primary' : 'bg-light'
                                            }`}
                                        style={{
                                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease',
                                            border: `1px solid ${inputType === type.id ? '' : '#dee2e6'}`
                                        }}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            {inputType === 'file' ? (
                                <>
                                    <Form.Label className='fw-bold'>
                                        {fileLabel} <span style={{ fontSize: "12px" }}>(5 MB)</span>
                                        <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>*</span>
                                    </Form.Label>
                                    <div className="d-flex flex-column">
                                        <div className="d-flex align-items-center">
                                            <Form.Control
                                                type="file"
                                                id="CoverURL"
                                                name="CoverURL"
                                                onChange={handleFileChange}
                                                onBlur={formik.handleBlur}
                                                disabled={isSubmitting}
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
                                                    {(selectedFile || currentFileName) && (
                                                        <span style={{ fontSize: "0.8rem", color: "#5E95FE" }}>
                                                            {selectedFile ? selectedFile.name : currentFileName}
                                                        </span>
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <Form.Group>
                                    <Form.Label className='fw-bold'>
                                        Cover Image URL
                                        <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter image URL"
                                        value={coverUrlText}
                                        onChange={(e) => setCoverUrlText(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>
                            )}

                            {formik.touched.CoverURL && formik.errors.CoverURL && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CoverURL}
                                </div>
                            )}
                        </Form.Group>


                        <div className='d-flex flex-wrap gap-sm-4'>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="CoverPremium"
                                    name="CoverPremium"
                                    label="Premium Cover"
                                    disabled={isSubmitting}
                                    checked={formik.values.CoverPremium}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="Safe"
                                    name="Safe"
                                    label="Safe Cover"
                                    disabled={isSubmitting}
                                    checked={formik.values.Safe}
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

            <ImagePreviewModal
                show={showPreview}
                onHide={() => setShowPreview(false)}
                images={filterData(data).map(item => item.CoverURL)} // Use the full filtered dataset
                currentIndex={previewIndex}
                onNavigate={handlePreviewNavigation} // Use the new navigation handler
            />
        </div>
    );

};
export default CoverURL;