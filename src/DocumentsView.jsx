// Trong file DocumentsView.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { API_CONFIG, apiRequest, safeJsonParse, TokenManager } from './api';
import Header from './DocumentView/Header';
import ErrorAlert from './DocumentView/ErrorAlert';
import SearchFilter from './DocumentView/SearchFilter';
import DocumentsTable from './DocumentView/DocumentsTable';
import Pagination from './DocumentView/Pagination';
import UploadModal from './DocumentView/UploadModal';
import EditModal from './DocumentView/EditModal';
import DeleteModal from './DocumentView/DeleteModal';
import DetailsModal from './DocumentView/DetailsModal';

// Danh sách loại tài liệu mặc định
const DEFAULT_FILE_TYPES = [
    'Tài liệu học tập',
    'Báo cáo nghiên cứu',
    'Luận văn/Luận án',
    'Giáo trình',
    'Bài giảng',
    'Tài liệu tham khảo',
    'Quy định/Thông tư',
    'Biểu mẫu',
    'Khác',
];

const DocumentsView = () => {
    const { user, isReady, refreshToken, loading: authLoading, error: authError } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [fileTypeFilter, setFileTypeFilter] = useState('');
    const [loadingData, setLoadingData] = useState(false);
    const [totalDocuments, setTotalDocuments] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isUploading, setIsUploading] = useState(false);
    const perPage = 10;

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Form states
    const [selectedFile, setSelectedFile] = useState(null);
    const [newDocType, setNewDocType] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [uploadedBy, setUploadedBy] = useState('');

    // Edit states
    const [editingDocument, setEditingDocument] = useState(null);
    const [editFilename, setEditFilename] = useState('');
    const [editFileType, setEditFileType] = useState('');
    const [editSelectedUsers, setEditSelectedUsers] = useState([]);
    const [editSelectedDepartments, setEditSelectedDepartments] = useState([]);
    const [editUploadedBy, setEditUploadedBy] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Delete states
    const [deletingDocument, setDeletingDocument] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Details states
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documentDetails, setDocumentDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Data states
    const [fileTypes, setFileTypes] = useState(DEFAULT_FILE_TYPES);
    const [users, setUsers] = useState([]);
    const [usersPagination, setUsersPagination] = useState({
        total: 0,
        pages: 0,
        perPage: 10,
        currentPage: 1,
        has_next: false,
        has_prev: false,
    });
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [departmentsPagination, setDepartmentsPagination] = useState({
        total: 0,
        pages: 0,
        perPage: 10,
        currentPage: 1,
        has_next: false,
        has_prev: false,
    });
    const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
    const [error, setError] = useState('');

    // Token validation helper
    const validateToken = useCallback(async () => {
        if (!isReady || !TokenManager.get()) {
            setError('Vui lòng đăng nhập lại để tiếp tục');
            return false;
        }

        if (TokenManager.isExpiringSoon()) {
            try {
                await refreshToken();
                return true;
            } catch (error) {
                setError('Không thể làm mới token, vui lòng đăng nhập lại');
                return false;
            }
        }

        return true;
    }, [isReady, refreshToken]);

    // Update uploadedBy when user changes
    useEffect(() => {
        if (user?.username) {
            setUploadedBy(user.username);
        }
    }, [user]);

    // Fetch file types
    const fetchFileTypes = useCallback(async () => {
        if (!isReady) return;
        const isValid = await validateToken();
        if (!isValid) return;

        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.DOCUMENTS_TYPES, {}, true, false);
            if (response.ok) {
                const data = await safeJsonParse(response);
                if (data?.folders?.length > 0) {
                    setFileTypes(data.folders);
                } else {
                    setFileTypes(DEFAULT_FILE_TYPES);
                    setError('Dữ liệu loại tài liệu trống, sử dụng danh sách mặc định');
                }
            } else {
                setFileTypes(DEFAULT_FILE_TYPES);
                setError('Không thể tải danh sách loại tài liệu, sử dụng danh sách mặc định');
            }
        } catch (error) {
            setFileTypes(DEFAULT_FILE_TYPES);
            setError('Lỗi khi tải danh sách loại tài liệu: ' + error.message);
        }
    }, [isReady, validateToken]);

    // Fetch users
    const fetchUsers = useCallback(async (page = 1, search = '') => {
        if (!isReady) return;
        const isValid = await validateToken();
        if (!isValid) return;

        setIsLoadingUsers(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('per_page', '10');
            if (search) params.append('q', search);

            const endpoint = `${API_CONFIG.ENDPOINTS.ALL_USERS}?${params}`;
            const response = await apiRequest(endpoint, {}, true, true);

            if (response.ok) {
                const data = await safeJsonParse(response);
                setUsers(data.data?.users || []);
                setUsersPagination({
                    total: data.data?.pagination?.total || 0,
                    pages: data.data?.pagination?.pages || 0,
                    perPage: data.data?.pagination?.per_page || 10,
                    currentPage: data.data?.pagination?.page || page,
                    has_next: data.data?.pagination?.has_next || false,
                    has_prev: data.data?.pagination?.has_prev || false,
                });
            } else {
                setUsers([]);
                setError('Không thể tải danh sách người dùng');
            }
        } catch (error) {
            setUsers([]);
            setError('Lỗi khi tải danh sách người dùng');
        } finally {
            setIsLoadingUsers(false);
        }
    }, [isReady, validateToken]);

    // Fetch departments
    const fetchDepartments = useCallback(async (page = 1, search = '') => {
        if (!isReady) return;
        const isValid = await validateToken();
        if (!isValid) return;

        setIsLoadingDepartments(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('per_page', '10');
            if (search) params.append('q', search);

            const endpoint = `${API_CONFIG.ENDPOINTS.DEPARTMENTS}?${params}`;
            const response = await apiRequest(endpoint, {}, true, true);

            if (response.ok) {
                const data = await safeJsonParse(response);
                const departmentsList = data.data?.departments || data.departments || [];

                const mappedDepartments = departmentsList.map(dept => ({
                    department_id: dept.department_id || dept.id || dept._id,
                    name: dept.name || dept.department_name,
                    code: dept.code || dept.department_code || dept.name?.substring(0, 4).toUpperCase(),
                }));

                setDepartments(mappedDepartments);
                setDepartmentsPagination({
                    total: data.data?.pagination?.total || data.total || departmentsList.length,
                    pages: data.data?.pagination?.pages || data.pages || Math.ceil(departmentsList.length / 10),
                    perPage: data.data?.pagination?.per_page || data.per_page || 10,
                    currentPage: data.data?.pagination?.page || data.page || page,
                    has_next: data.data?.pagination?.has_next || data.has_next || false,
                    has_prev: data.data?.pagination?.has_prev || data.has_prev || false,
                });
            } else {
                const defaultDepartments = [
                    { department_id: 'dept1', name: 'Khoa Toán', code: 'MATH' },
                    { department_id: 'dept2', name: 'Khoa Vật Lý', code: 'PHYS' },
                    { department_id: 'dept3', name: 'Khoa Công Nghệ Thông Tin', code: 'CS' },
                    { department_id: 'dept4', name: 'Khoa Kinh Tế', code: 'ECON' },
                    { department_id: 'dept5', name: 'Khoa Ngoại Ngữ', code: 'LANG' },
                ];

                let filteredDepartments = defaultDepartments;
                if (search) {
                    filteredDepartments = defaultDepartments.filter(
                        dept =>
                            dept.name.toLowerCase().includes(search.toLowerCase()) ||
                            dept.code.toLowerCase().includes(search.toLowerCase())
                    );
                }

                const total = filteredDepartments.length;
                const start = (page - 1) * 10;
                const paginatedDepartments = filteredDepartments.slice(start, start + 10);

                setDepartments(paginatedDepartments);
                setDepartmentsPagination({
                    total,
                    pages: Math.ceil(total / 10),
                    perPage: 10,
                    currentPage: page,
                    has_next: page < Math.ceil(total / 10),
                    has_prev: page > 1,
                });

                setError('Không thể tải danh sách phòng ban từ server, sử dụng dữ liệu mặc định');
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            setError('Lỗi khi tải danh sách phòng ban');
            setDepartments([]);
        } finally {
            setIsLoadingDepartments(false);
        }
    }, [isReady, validateToken]);

    // Fetch document details
    const fetchDocumentDetails = useCallback(async (documentId) => {
        if (!isReady) return;
        const isValid = await validateToken();
        if (!isValid || !documentId) {
            setError('Token không hợp lệ hoặc ID tài liệu trống');
            setIsLoadingDetails(false);
            return;
        }

        setIsLoadingDetails(true);
        try {
            const endpoint = `${API_CONFIG.ENDPOINTS.DOCUMENTS_LIST}/details/${documentId}`;
            const response = await apiRequest(endpoint, {}, false, false);

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const data = await safeJsonParse(response);
            if (!data || !data.document) {
                throw new Error('Invalid response data');
            }

            let userDetails = [];
            const userIds = Array.isArray(data.document.role?.user)
                ? data.document.role.user
                : data.document.role?.user
                    ? [data.document.role.user]
                    : [];

            for (const userId of userIds) {
                try {
                    const userResponse = await apiRequest(
                        `${API_CONFIG.ENDPOINTS.SEARCH_USER}/${userId}`,
                        {},
                        true,
                        false
                    );
                    if (userResponse.ok) {
                        const userData = await safeJsonParse(userResponse);
                        userDetails.push({
                            user_id: userData.data.user.user_id || userId,
                            username: userData.data.user.username || userId,
                            full_name: userData.data.user.full_name || userId,
                            student_info: userData.data.user.student_info || null,
                            teacher_info: userData.data.user.teacher_info || null,
                        });
                    } else {
                        userDetails.push({
                            user_id: userId,
                            username: userId,
                            full_name: userId,
                            student_info: null,
                            teacher_info: null,
                        });
                    }
                } catch (userError) {
                    console.error(`Error fetching user ${userId}:`, userError);
                    userDetails.push({
                        user_id: userId,
                        username: userId,
                        full_name: userId,
                        student_info: null,
                        teacher_info: null,
                    });
                }
            }

            let departmentDetails = [];
            const departmentIds = Array.isArray(data.document.role?.subject)
                ? data.document.role.subject
                : data.document.role?.subject
                    ? [data.document.role.subject]
                    : [];

            for (const deptId of departmentIds) {
                try {
                    const deptResponse = await apiRequest(
                        `${API_CONFIG.ENDPOINTS.SEARCH_DEPARTMENT}/${deptId}`,
                        {},
                        true,
                        false
                    );
                    if (deptResponse.ok) {
                        const deptData = await safeJsonParse(deptResponse);
                        departmentDetails.push({
                            department_id: deptData.data.department.department_id || deptId,
                            department_name: deptData.data.department.department_name || deptId,
                            code: deptData.data.department.code || deptId,
                        });
                    } else {
                        departmentDetails.push({
                            department_id: deptId,
                            department_name: deptId,
                            code: deptId,
                        });
                    }
                } catch (deptError) {
                    console.error(`Error fetching department ${deptId}:`, deptError);
                    departmentDetails.push({
                        department_id: deptId,
                        department_name: deptId,
                        code: deptId,
                    });
                }
            }

            setEditSelectedUsers(userDetails.map(user => user.user_id));
            setEditSelectedDepartments(departmentDetails.map(dept => dept.department_id));

            setDocumentDetails({
                document: data.document,
                users: userDetails,
                departments: departmentDetails,
            });
            setError('');
        } catch (error) {
            console.error('Error fetching document details:', error);
            setEditSelectedUsers(
                Array.isArray(selectedDocument?.role?.user)
                    ? selectedDocument.role.user
                    : selectedDocument?.role?.user
                        ? [selectedDocument.role.user]
                        : []
            );
            setEditSelectedDepartments(
                Array.isArray(selectedDocument?.role?.subject)
                    ? selectedDocument.role.subject
                    : selectedDocument?.role?.subject
                        ? [selectedDocument.role.subject]
                        : []
            );
            setDocumentDetails({
                document: selectedDocument,
                users: Array.isArray(selectedDocument?.role?.user)
                    ? selectedDocument.role.user.map(userId => ({
                        user_id: userId,
                        username: userId,
                        full_name: userId,
                        student_info: null,
                        teacher_info: null,
                    }))
                    : selectedDocument?.role?.user
                        ? [
                            {
                                user_id: selectedDocument.role.user,
                                username: selectedDocument.role.user,
                                full_name: selectedDocument.role.user,
                                student_info: null,
                                teacher_info: null,
                            },
                        ]
                        : [],
                departments: Array.isArray(selectedDocument?.role?.subject)
                    ? selectedDocument.role.subject.map(deptId => ({
                        department_id: deptId,
                        department_name: deptId,
                        code: deptId,
                    }))
                    : selectedDocument?.role?.subject
                        ? [
                            {
                                department_id: selectedDocument.role.subject,
                                department_name: selectedDocument.role.subject,
                                code: selectedDocument.role.subject,
                            },
                        ]
                        : [],
            });
            setError(`Lỗi khi tải chi tiết tài liệu: ${error.message}`);
        } finally {
            setIsLoadingDetails(false);
        }
    }, [isReady, validateToken, selectedDocument]);

    // Fetch documents
    const fetchDocuments = useCallback(
        async (fileType = '', search = '', page = 1, limit = perPage) => {
            if (!isReady) {
                console.warn('fetchDocuments called before auth is ready. Aborting.');
                return;
            }
            const isValid = await validateToken();
            if (!isValid) return;

            setLoadingData(true);
            setError('');
            try {
                const skip = (page - 1) * limit;
                const params = new URLSearchParams();
                if (fileType) params.append('file_type', fileType);
                if (search) params.append('q', search);
                params.append('limit', limit.toString());
                params.append('skip', skip.toString());

                const endpoint = `${API_CONFIG.ENDPOINTS.DOCUMENTS_LIST}?${params}`;
                const response = await apiRequest(endpoint, {}, false, false);

                if (response.ok) {
                    const data = await safeJsonParse(response);
                    setDocuments(data.documents || []);
                    setTotalDocuments(data.total || 0);
                } else {
                    setDocuments([]);
                    setTotalDocuments(0);
                    setError(
                        response.status === 401
                            ? 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại'
                            : 'Không thể tải danh sách tài liệu'
                    );
                }
            } catch (error) {
                setDocuments([]);
                setTotalDocuments(0);
                setError('Lỗi kết nối khi tải tài liệu');
            } finally {
                setLoadingData(false);
            }
        },
        [isReady, perPage, validateToken]
    );

    // Delete document
    const handleDelete = async (docId) => {
        if (!isReady) return;
        const isValid = await validateToken();
        if (!isValid) return;

        setIsDeleting(true);
        try {
            const response = await apiRequest(
                `${API_CONFIG.ENDPOINTS.VECTOR_DELETE}/${docId}`,
                {
                    method: 'DELETE',
                },
                false,
                false
            );

            if (response.ok) {
                setIsDeleteModalOpen(false);
                setDeletingDocument(null);
                fetchDocuments(fileTypeFilter, searchQuery, currentPage);
                setError('');
            } else {
                setError('Không thể xóa tài liệu');
            }
        } catch (error) {
            setError('Lỗi khi xóa tài liệu');
        } finally {
            setIsDeleting(false);
        }
    };

    // Update document
    const handleUpdate = async () => {
        if (!isReady) return;
        const isValid = await validateToken();
        if (!editingDocument || !isValid) return;

        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append('filename', editFilename.replace(/\.[^/.]+$/, ''));
            formData.append('file_type', editFileType);
            formData.append('uploaded_by', editUploadedBy);
            formData.append(
                'role_user',
                JSON.stringify(editSelectedUsers.length > 0 ? editSelectedUsers : [])
            );
            formData.append(
                'role_subject',
                JSON.stringify(editSelectedDepartments.length > 0 ? editSelectedDepartments : [])
            );

            const response = await apiRequest(
                `${API_CONFIG.ENDPOINTS.VECTOR_UPDATE}/${editingDocument._id}`,
                {
                    method: 'PUT',
                    body: formData,
                },
                false,
                false
            );

            if (response.ok) {
                setIsEditModalOpen(false);
                setEditingDocument(null);
                setEditSelectedUsers([]);
                setEditSelectedDepartments([]);
                fetchDocuments(fileTypeFilter, searchQuery, currentPage);
                setError('');
            } else {
                const errorData = await response.json();
                setError(`Không thể cập nhật tài liệu: ${errorData.detail || 'Lỗi không xác định'}`);
            }
        } catch (error) {
            setError('Lỗi khi cập nhật tài liệu: ' + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    // Upload document
    const handleUpload = async () => {
        if (!isReady) return;
        const isValid = await validateToken();
        if (!selectedFile || !newDocType || !uploadedBy || !isValid) {
            setError('Vui lòng chọn tệp, loại tài liệu và đảm bảo đã đăng nhập.');
            return;
        }

        if (!(selectedFile instanceof File)) {
            setError('Tệp không hợp lệ. Vui lòng chọn một tệp từ thiết bị.');
            return;
        }

        setIsUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('file_type', newDocType);
            formData.append('uploaded_by', uploadedBy);
            formData.append('role_user', JSON.stringify(selectedUsers.length > 0 ? selectedUsers : []));
            formData.append(
                'role_subject',
                JSON.stringify(selectedDepartments.length > 0 ? selectedDepartments : [])
            );

            const response = await apiRequest(API_CONFIG.ENDPOINTS.VECTOR_ADD, {
                method: 'POST',
                body: formData,
            }, false, false);

            if (response.ok) {
                setIsModalOpen(false);
                resetUploadForm();
                fetchDocuments(fileTypeFilter, searchQuery, currentPage);
                setError('');
            } else {
                const errorData = await response.json();
                setError(`Không thể tải lên tài liệu: ${errorData.detail || 'Lỗi không xác định'}`);
            }
        } catch (error) {
            setError('Lỗi khi tải lên tài liệu: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    // Reset upload form
    const resetUploadForm = () => {
        setSelectedFile(null);
        setNewDocType('');
        setSelectedUsers([]);
        setSelectedDepartments([]);
        setUploadedBy(user?.username || '');
    };

    // Handle file change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validExtensions = ['.pdf', '.txt', '.docx', '.csv', '.xlsx', '.xls'];
            const fileExtension = file.name.toLowerCase().match(/\.[^/.]+$/);
            if (!fileExtension || !validExtensions.includes(fileExtension[0])) {
                setError(
                    'Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp .pdf, .txt, .docx, .csv, .xlsx hoặc .xls.'
                );
                setSelectedFile(null);
            } else {
                setSelectedFile(file);
                setError('');
            }
        } else {
            setSelectedFile(null);
        }
    };

    // Open edit modal
    const openEditModal = async (doc) => {
        setEditingDocument(doc);
        setEditFilename(doc.filename);
        setEditFileType(doc.file_type);
        setEditUploadedBy(doc.uploaded_by || 'default_user');
        setIsEditModalOpen(true);
        await fetchDocumentDetails(doc._id);
    };

    // Open delete modal
    const openDeleteModal = (doc) => {
        setDeletingDocument(doc);
        setIsDeleteModalOpen(true);
    };

    // Open details modal
    const openDetailsModal = async (doc) => {
        setSelectedDocument(doc);
        setIsDetailsModalOpen(true);
        await fetchDocumentDetails(doc._id);
    };

    // Initialize data with retry mechanism
    const initializeData = useCallback(async () => {
        if (!isReady || !user || authLoading) return;

        setLoadingData(true);
        setError('');
        try {
            await Promise.all([
                fetchFileTypes(),
                fetchUsers(1),
                fetchDepartments(1),
                fetchDocuments(fileTypeFilter, searchQuery, currentPage),
            ]);
        } catch (error) {
            setError('Lỗi khi tải dữ liệu ban đầu: ' + error.message);
        } finally {
            setLoadingData(false);
        }
    }, [isReady, user, authLoading, fileTypeFilter, searchQuery, currentPage, fetchFileTypes, fetchUsers, fetchDepartments, fetchDocuments]);

    // Trigger data initialization
    useEffect(() => {
        // Chỉ thực hiện fetch khi context đã sẵn sàng
        if (isReady) {
            console.log('Auth is ready, fetching initial data...');
            initializeData();
        } else {
            console.log('Auth is not ready yet, waiting...');
        }
        // Thêm isReady vào dependency array
    }, [isReady, initializeData]);

    // Show loading or error state
    if (authLoading || loadingData) {
        return <div className="flex-1 p-6">Đang tải dữ liệu...</div>;
    }

    if (authError || !isReady) {
        return <div className="flex-1 p-6">Vui lòng đăng nhập để tiếp tục. {authError}</div>;
    }

    return (
        <div className="flex-1 p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            <Header setIsModalOpen={setIsModalOpen} resetUploadForm={resetUploadForm} />
            <ErrorAlert error={error} setError={setError} />
            <SearchFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                fileTypeFilter={fileTypeFilter}
                setFileTypeFilter={setFileTypeFilter}
                fileTypes={fileTypes}
                setCurrentPage={setCurrentPage}
            />
            <DocumentsTable
                documents={documents}
                loading={loadingData}
                openDetailsModal={openDetailsModal}
                openEditModal={openEditModal}
                openDeleteModal={openDeleteModal}
            />
            <Pagination
                totalDocuments={totalDocuments}
                perPage={perPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
            <UploadModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                selectedFile={selectedFile}
                handleFileChange={handleFileChange}
                newDocType={newDocType}
                setNewDocType={setNewDocType}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                selectedDepartments={selectedDepartments}
                setSelectedDepartments={setSelectedDepartments}
                uploadedBy={uploadedBy}
                users={users}
                fetchUsers={fetchUsers}
                usersPagination={usersPagination}
                isLoadingUsers={isLoadingUsers}
                departments={departments}
                fetchDepartments={fetchDepartments}
                departmentsPagination={departmentsPagination}
                isLoadingDepartments={isLoadingDepartments}
                fileTypes={fileTypes}
                isUploading={isUploading}
                handleUpload={handleUpload}
                error={error}
                setError={setError}
                resetUploadForm={resetUploadForm}
                user={user}
            />
            <EditModal
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                editingDocument={editingDocument}
                editFilename={editFilename}
                setEditFilename={setEditFilename}
                editFileType={editFileType}
                setEditFileType={setEditFileType}
                editSelectedUsers={editSelectedUsers}
                setEditSelectedUsers={setEditSelectedUsers}
                editSelectedDepartments={editSelectedDepartments}
                setEditSelectedDepartments={setEditSelectedDepartments}
                editUploadedBy={editUploadedBy}
                users={users}
                fetchUsers={fetchUsers}
                usersPagination={usersPagination}
                isLoadingUsers={isLoadingUsers}
                departments={departments}
                fetchDepartments={fetchDepartments}
                departmentsPagination={departmentsPagination}
                isLoadingDepartments={isLoadingDepartments}
                fileTypes={fileTypes}
                isUpdating={isUpdating}
                handleUpdate={handleUpdate}
                error={error}
                setError={setError}
                isLoadingDetails={isLoadingDetails}
            />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                deletingDocument={deletingDocument}
                isDeleting={isDeleting}
                handleDelete={handleDelete}
            />
            <DetailsModal
                isOpen={isDetailsModalOpen}
                setIsOpen={setIsDetailsModalOpen}
                documentDetails={documentDetails}
                isLoadingDetails={isLoadingDetails}
                error={error}
            />
        </div>
    );
};

export default DocumentsView;