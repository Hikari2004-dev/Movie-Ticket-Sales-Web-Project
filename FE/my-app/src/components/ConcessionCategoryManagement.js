import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const ConcessionCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    displayOrder: 0,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể tải danh mục');

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      categoryName: '',
      description: '',
      displayOrder: categories.length + 1,
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setFormData({
      categoryName: category.categoryName || '',
      description: category.description || '',
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/concessions/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể xóa danh mục');

      toast.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể xóa danh mục');
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/categories/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể cập nhật trạng thái');

      toast.success('Cập nhật trạng thái thành công');
      fetchCategories();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = modalMode === 'create'
        ? `${API_BASE_URL}/concessions/categories`
        : `${API_BASE_URL}/concessions/categories/${selectedCategory.id}`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }

      toast.success(modalMode === 'create' ? 'Tạo danh mục thành công' : 'Cập nhật danh mục thành công');
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏷️ Quản Lý Danh Mục Bắp Nước</h1>
          <p style={styles.subtitle}>Quản lý các danh mục sản phẩm bắp nước (Combo, Bắp rang, Nước ngọt...)</p>
        </div>
        <button style={styles.createButton} onClick={handleCreate}>
          + Thêm Danh Mục
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : categories.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🏷️</div>
          <h3>Chưa có danh mục nào</h3>
          <p>Nhấn "Thêm Danh Mục" để tạo danh mục mới</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>STT</th>
                <th style={styles.th}>Tên danh mục</th>
                <th style={styles.th}>Mô tả</th>
                <th style={styles.th}>Thứ tự</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id} style={styles.tableRow}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>
                    <span style={styles.categoryName}>{category.categoryName}</span>
                  </td>
                  <td style={styles.td}>{category.description || '-'}</td>
                  <td style={styles.td}>{category.displayOrder}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: category.isActive ? '#d4edda' : '#f8d7da',
                      color: category.isActive ? '#155724' : '#721c24'
                    }}>
                      {category.isActive ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button style={styles.editButton} onClick={() => handleEdit(category)}>
                        ✏️ Sửa
                      </button>
                      <button style={styles.toggleButton} onClick={() => handleToggle(category.id)}>
                        {category.isActive ? '🔒 Tắt' : '🔓 Bật'}
                      </button>
                      <button style={styles.deleteButton} onClick={() => handleDelete(category.id)}>
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {modalMode === 'create' ? '✨ Thêm Danh Mục Mới' : '✏️ Chỉnh Sửa Danh Mục'}
              </h2>
              <button style={styles.closeButton} onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Tên danh mục *</label>
                  <input
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({...formData, categoryName: e.target.value})}
                    required
                    style={styles.formInput}
                    placeholder="VD: Combo, Bắp rang, Nước ngọt..."
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={{...styles.formInput, minHeight: '80px', resize: 'vertical'}}
                    placeholder="Mô tả về danh mục..."
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Thứ tự hiển thị</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                      style={styles.formInput}
                      min="0"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Trạng thái</label>
                    <select
                      value={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                      style={styles.formInput}
                    >
                      <option value="true">Hoạt động</option>
                      <option value="false">Tắt</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  style={styles.cancelButton}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.submitButton}
                >
                  {submitting ? 'Đang lưu...' : (modalMode === 'create' ? '✨ Tạo mới' : '💾 Cập nhật')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0'
  },
  createButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 32px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4CAF50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 32px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeaderRow: {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #e9ecef'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '13px',
    color: '#495057',
    textTransform: 'uppercase'
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#333',
    verticalAlign: 'middle'
  },
  categoryName: {
    fontWeight: '600',
    color: '#1a1a1a'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    padding: '8px 12px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  toggleButton: {
    padding: '8px 12px',
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '8px 12px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    margin: '0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px'
  },
  modalBody: {
    padding: '24px'
  },
  formGroup: {
    marginBottom: '20px',
    flex: '1'
  },
  formLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px'
  },
  formInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e9ecef',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    backgroundColor: '#f8f9fa'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default ConcessionCategoryManagement;
