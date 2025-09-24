import React, { useState, useEffect } from 'react';
import { Search, Building, CheckCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const DepartmentSelector = ({ selectedDepartments, setSelectedDepartments, label, departments, fetchDepartments, departmentsPagination, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Fetch departments when search term or page changes
    useEffect(() => {
        if (isDropdownOpen) {
            fetchDepartments(departmentsPagination.currentPage, searchTerm);
        }
    }, [searchTerm, departmentsPagination.currentPage, isDropdownOpen, fetchDepartments]);

    // Log selectedDepartments để debug
    useEffect(() => {
        console.log('DepartmentSelector - selectedDepartments:', selectedDepartments);
    }, [selectedDepartments]);

    const filteredDepartments = searchTerm
        ? departments.filter(dept =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.code.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : departments;

    const toggleDepartment = (deptId) => {
        // Đảm bảo selectedDepartments là mảng
        const currentDepartments = Array.isArray(selectedDepartments) ? selectedDepartments : [];
        if (currentDepartments.includes(deptId)) {
            setSelectedDepartments(currentDepartments.filter(id => id !== deptId));
        } else {
            setSelectedDepartments([...currentDepartments, deptId]);
        }
    };

    const getSelectedDepartmentNames = () => {
        return selectedDepartments
            .map(id => {
                const dept = departments.find(d => d.department_id === id);
                return dept ? dept.name : id;
            })
            .join(', ');
    };

    return (
        <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
            <div
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer bg-white hover:bg-gray-50 min-h-[48px] flex items-center hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <Building className="w-5 h-5 text-gray-400 mr-3 group-hover:text-blue-500 transition-colors duration-200" />
                {selectedDepartments.length > 0 ? (
                    <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 line-clamp-1">{getSelectedDepartmentNames()}</span>
                        <div className="text-xs text-blue-600 mt-0.5 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {selectedDepartments.length} {selectedDepartments.length === 1 ? 'phòng' : 'phòng ban'} đã chọn
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-500 text-sm font-medium group-hover:text-gray-700 transition-colors duration-200">
                        Chọn phòng ban có quyền truy cập...
                    </span>
                )}
            </div>

            {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-[70vh] overflow-hidden transform animate-in slide-in-from-top-2 duration-200 flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm phòng ban..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white transition-all duration-200"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="px-6 py-8 text-center">
                                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 text-blue-500" />
                                <p className="text-sm text-gray-500 font-medium">Đang tải danh sách...</p>
                            </div>
                        ) : filteredDepartments.length === 0 ? (
                            <div className="px-6 py-8 text-center">
                                <Building className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 font-medium">
                                    {searchTerm ? 'Không tìm thấy phòng ban phù hợp' : 'Danh sách phòng ban trống'}
                                </p>
                            </div>
                        ) : (
                            <div className="py-2">
                                {filteredDepartments.map((dept) => (
                                    <div
                                        key={dept.department_id}
                                        className={`mx-2 mb-1 px-3 py-3 hover:bg-blue-50 cursor-pointer rounded-lg transition-all duration-200 ${selectedDepartments.includes(dept.department_id)
                                            ? 'bg-blue-50 border border-blue-200'
                                            : 'hover:shadow-sm'
                                            }`}
                                        onClick={() => toggleDepartment(dept.department_id)}
                                    >
                                        <div className="flex items-center min-w-0 flex-1">
                                            <div
                                                className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center transition-all duration-200 ${selectedDepartments.includes(dept.department_id)
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : 'border-gray-300 hover:border-blue-400'
                                                    }`}
                                            >
                                                {selectedDepartments.includes(dept.department_id) && (
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {String(dept.name || dept.department_id).charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm truncate">{dept.name || dept.department_id}</p>
                                                    {/* <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-gray-500">@{dept.code || dept.department_id}</span>
                                                    </div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="border-t border-gray-100 bg-white px-4 py-3 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            {selectedDepartments.length > 0 && (
                                <span className="text-blue-600 font-medium">
                                    Đã chọn {selectedDepartments.length} {selectedDepartments.length === 1 ? 'phòng' : 'phòng ban'}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchDepartments(departmentsPagination.currentPage - 1, searchTerm)}
                                disabled={!departmentsPagination.has_prev}
                                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-gray-600">
                                Trang {departmentsPagination.currentPage} / {departmentsPagination.pages}
                            </span>
                            <button
                                onClick={() => fetchDepartments(departmentsPagination.currentPage + 1, searchTerm)}
                                disabled={!departmentsPagination.has_next}
                                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentSelector;