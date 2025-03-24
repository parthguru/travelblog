'use client';

import { useState, useEffect, FormEvent } from 'react';
import { PlusCircle, Edit, Trash2, Save, X, Check } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  post_count?: number;
}

export default function CategoriesPage() {
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [editMode, setEditMode] = useState<'create' | 'edit' | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirmation
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/blog/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };
  
  // Start editing a category
  const startEdit = (category: Category) => {
    setEditMode('edit');
    setSelectedCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setFormError('');
  };
  
  // Start creating a new category
  const startCreate = () => {
    setEditMode('create');
    setSelectedCategoryId(null);
    setCategoryName('');
    setCategoryDescription('');
    setFormError('');
  };
  
  // Cancel editing/creating
  const cancelEdit = () => {
    setEditMode(null);
    setSelectedCategoryId(null);
    setCategoryName('');
    setCategoryDescription('');
    setFormError('');
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      setFormError('Category name is required');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      if (editMode === 'create') {
        // Create new category
        const response = await fetch('/api/admin/blog/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: categoryName,
            description: categoryDescription || null
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create category');
        }
      } else if (editMode === 'edit' && selectedCategoryId) {
        // Update existing category
        const response = await fetch(`/api/admin/blog/categories/${selectedCategoryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: categoryName,
            description: categoryDescription || null
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update category');
        }
      }
      
      // Reset form and refresh categories
      cancelEdit();
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      setFormError((err as Error).message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle category deletion
  const confirmDelete = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setShowDeleteModal(true);
  };
  
  const handleDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/admin/blog/categories/${categoryToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }
      
      // Refresh categories
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError((err as Error).message || 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Blog Categories</h1>
        <div className="text-center py-10">Loading categories...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog Categories</h1>
        {!editMode && (
          <button
            onClick={startCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Category Form */}
      {editMode && (
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editMode === 'create' ? 'Add New Category' : 'Edit Category'}
          </h2>
          
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {formError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                id="name"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the category"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <p className="text-gray-500">No categories found</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posts
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className={editMode === 'edit' && selectedCategoryId === category.id ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{category.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {category.post_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => startEdit(category)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      disabled={editMode !== null}
                    >
                      <Edit className="h-4 w-4 inline" />
                    </button>
                    <button 
                      onClick={() => confirmDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={editMode !== null}
                    >
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Delete Category</h3>
            <p className="mb-6">Are you sure you want to delete this category? Associated posts will not be deleted but will become uncategorized.</p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 