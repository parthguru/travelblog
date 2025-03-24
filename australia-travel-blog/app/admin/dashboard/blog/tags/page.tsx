'use client';

import { useState, useEffect, FormEvent } from 'react';
import { PlusCircle, Edit, Trash2, Save, X, Check } from 'lucide-react';

interface Tag {
  id: number;
  name: string;
  slug: string;
  post_count?: number;
}

export default function TagsPage() {
  // Tags state
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [editMode, setEditMode] = useState<'create' | 'edit' | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [tagName, setTagName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirmation
  const [tagToDelete, setTagToDelete] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Fetch tags
  useEffect(() => {
    fetchTags();
  }, []);
  
  const fetchTags = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/blog/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      
      const data = await response.json();
      setTags(data);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };
  
  // Start editing a tag
  const startEdit = (tag: Tag) => {
    setEditMode('edit');
    setSelectedTagId(tag.id);
    setTagName(tag.name);
    setFormError('');
  };
  
  // Start creating a new tag
  const startCreate = () => {
    setEditMode('create');
    setSelectedTagId(null);
    setTagName('');
    setFormError('');
  };
  
  // Cancel editing/creating
  const cancelEdit = () => {
    setEditMode(null);
    setSelectedTagId(null);
    setTagName('');
    setFormError('');
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!tagName.trim()) {
      setFormError('Tag name is required');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      if (editMode === 'create') {
        // Create new tag
        const response = await fetch('/api/admin/blog/tags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: tagName
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create tag');
        }
      } else if (editMode === 'edit' && selectedTagId) {
        // Update existing tag
        const response = await fetch(`/api/admin/blog/tags/${selectedTagId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: tagName
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update tag');
        }
      }
      
      // Reset form and refresh tags
      cancelEdit();
      fetchTags();
    } catch (err) {
      console.error('Error saving tag:', err);
      setFormError((err as Error).message || 'Failed to save tag');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle tag deletion
  const confirmDelete = (tagId: number) => {
    setTagToDelete(tagId);
    setShowDeleteModal(true);
  };
  
  const handleDelete = async () => {
    if (!tagToDelete) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/admin/blog/tags/${tagToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete tag');
      }
      
      // Refresh tags
      fetchTags();
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError((err as Error).message || 'Failed to delete tag');
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setTagToDelete(null);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Blog Tags</h1>
        <div className="text-center py-10">Loading tags...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog Tags</h1>
        {!editMode && (
          <button
            onClick={startCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Tag
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Tag Form */}
      {editMode && (
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editMode === 'create' ? 'Add New Tag' : 'Edit Tag'}
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
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Tag'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Tags List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {tags.length > 0 ? (
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
                  Post Count
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{tag.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{tag.post_count || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => startEdit(tag)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      disabled={editMode !== null}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(tag.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={editMode !== null}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No tags found. Create your first tag to get started.
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-medium mb-4">Delete Tag</h3>
            <p className="mb-6">
              Are you sure you want to delete this tag? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
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