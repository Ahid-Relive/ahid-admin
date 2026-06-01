'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal } from '@/components/ui/Modal';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { IconPicker } from '@/components/ui/IconPicker';
import type { SelectedIcon } from '@/components/ui/IconPicker';
import {
    useGetAllCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryIconMutation,
    useDeleteCategoryMutation,
} from '@/lib/features/categories/categoriesApi';
import type { Category } from '@/lib/features/categories/categoriesApi';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, Search, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function CategoryIcon({ svg, size = 32 }: { svg: string; size?: number }) {
    if (!svg) {
        return (
            <div
                className="flex items-center justify-center text-[var(--text-tertiary)]"
                style={{ width: size, height: size }}
            >
                <ImageIcon style={{ width: size * 0.65, height: size * 0.65 }} />
            </div>
        );
    }
    return (
        <span
            className="flex items-center justify-center text-[var(--primary)] [&>svg]:w-full [&>svg]:h-full"
            style={{ width: size, height: size }}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}

interface FormData {
    name: string;
    slug: string;
    icon: string;
    iconName: string;
}

function CategoriesContent() {
    const { data, isLoading, error } = useGetAllCategoriesQuery();
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategoryIcon, { isLoading: isUpdating }] = useUpdateCategoryIconMutation();
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [formError, setFormError] = useState('');

    const [formData, setFormData] = useState<FormData>({
        name: '',
        slug: '',
        icon: '',
        iconName: '',
    });

    // Automatically derive slug from name
    useEffect(() => {
        if (isCreateModalOpen) {
            setFormData((prev) => ({ ...prev, slug: slugify(prev.name) }));
        }
    }, [formData.name, isCreateModalOpen]);

    const resetForm = () => {
        setFormData({ name: '', slug: '', icon: '', iconName: '' });
        setFormError('');
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!formData.name.trim()) {
            setFormError('Category name is required');
            return;
        }
        if (!formData.icon) {
            setFormError('Please select an icon');
            return;
        }
        try {
            await createCategory({
                name: formData.name.trim(),
                slug: formData.slug || slugify(formData.name),
                icon: formData.icon,
            }).unwrap();
            setIsCreateModalOpen(false);
            resetForm();
        } catch (err: unknown) {
            const apiError = err as { data?: { message?: string } };
            setFormError(apiError?.data?.message || 'Failed to create category');
        }
    };

    const handleIconSelected = (icon: SelectedIcon) => {
        setFormData((prev) => ({ ...prev, icon: icon.svg, iconName: icon.name }));
    };

    const handleEditIconSelected = async (icon: SelectedIcon) => {
        if (!editingCategory) return;
        try {
            await updateCategoryIcon({ id: editingCategory._id, icon: icon.svg }).unwrap();
            setEditingCategory(null);
        } catch (err: unknown) {
            const apiError = err as { data?: { message?: string } };
            alert(apiError?.data?.message || 'Failed to update icon');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCategory(id).unwrap();
            setDeleteConfirmId(null);
        } catch (err: unknown) {
            const apiError = err as { data?: { message?: string } };
            alert(apiError?.data?.message || 'Failed to delete category');
        }
    };

    const filtered = (data?.data ?? []).filter(
        (cat) =>
            cat.name.toLowerCase().includes(search.toLowerCase()) ||
            cat.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Categories</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Manage the categories displayed in the app
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setIsCreateModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 shadow-sm">
                    <Layers className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                        {data?.count ?? 0}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">
                        {(data?.count ?? 0) === 1 ? 'category' : 'categories'}
                    </span>
                </div>
            </div>

            {/* Search */}
            {(data?.data?.length ?? 0) > 0 && (
                <div className="relative mb-5 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                        type="text"
                        placeholder="Search categories…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-colors"
                    />
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <LoadingSkeleton />
            ) : error ? (
                <div className="text-center py-16 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
                    <div className="w-12 h-12 rounded-full bg-[var(--danger-light)] flex items-center justify-center mx-auto mb-3">
                        <Layers className="w-6 h-6 text-[var(--danger)]" />
                    </div>
                    <p className="font-medium text-[var(--text-primary)]">Failed to load categories</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Please refresh the page and try again</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] border-dashed">
                    <div className="w-14 h-14 rounded-full bg-[var(--primary-light)] flex items-center justify-center mx-auto mb-4">
                        <Layers className="w-7 h-7 text-[var(--primary)]" />
                    </div>
                    <p className="font-semibold text-[var(--text-primary)]">
                        {search ? 'No matching categories' : 'No categories yet'}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xs mx-auto">
                        {search
                            ? 'Try a different search term'
                            : 'Add your first category to get started'}
                    </p>
                    {!search && (
                        <button
                            onClick={() => {
                                resetForm();
                                setIsCreateModalOpen(true);
                            }}
                            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Category
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filtered.map((category) => (
                        <CategoryCard
                            key={category._id}
                            category={category}
                            onEditIcon={() => setEditingCategory(category)}
                            onDelete={() => setDeleteConfirmId(category._id)}
                            isDeleting={isDeleting && deleteConfirmId === category._id}
                        />
                    ))}
                </div>
            )}

            {/* Create Category Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                }}
                title="Add Category"
                size="sm"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-5">
                    {formError && (
                        <div className="p-3 bg-[var(--danger-light)] border border-red-200 rounded-lg">
                            <p className="text-sm text-[var(--danger)]">{formError}</p>
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                            Category Name <span className="text-[var(--danger)]">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="e.g. Fashion & Apparel"
                            className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                            Slug
                            <span className="ml-1.5 text-xs text-[var(--text-tertiary)] font-normal">(auto-generated)</span>
                        </label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, slug: e.target.value }))
                            }
                            placeholder="fashion-apparel"
                            className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-colors"
                        />
                        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                            Used in URLs and API — automatically derived from the name
                        </p>
                    </div>

                    {/* Icon */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                            Icon <span className="text-[var(--danger)]">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsIconPickerOpen(true)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-all ${formData.icon
                                    ? 'border-[var(--primary)] bg-[var(--primary-light)] hover:bg-[var(--primary-subtle)]'
                                    : 'border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)]'
                                }`}
                        >
                            {formData.icon ? (
                                <>
                                    <CategoryIcon svg={formData.icon} size={28} />
                                    <span className="text-[var(--text-primary)] font-medium">{formData.iconName}</span>
                                    <span className="ml-auto text-xs text-[var(--primary)]">Change</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-7 h-7 rounded-lg border-2 border-dashed border-[var(--border-color)] flex items-center justify-center">
                                        <Plus className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                                    </div>
                                    <span className="text-[var(--text-tertiary)]">Click to choose an icon</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Preview */}
                    {formData.icon && formData.name && (
                        <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide font-medium mb-3">Preview</p>
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center">
                                    <CategoryIcon svg={formData.icon} size={30} />
                                </div>
                                <div>
                                    <p className="font-semibold text-[var(--text-primary)]">{formData.name}</p>
                                    <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">{formData.slug}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                resetForm();
                            }}
                            className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isCreating ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating…
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Create Category
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Icon Picker — for creating */}
            <IconPicker
                isOpen={isIconPickerOpen && isCreateModalOpen}
                onClose={() => setIsIconPickerOpen(false)}
                onSelect={handleIconSelected}
                currentIcon={formData.icon}
            />

            {/* Icon Picker — for editing existing category icon */}
            <IconPicker
                isOpen={editingCategory !== null && !isCreateModalOpen}
                onClose={() => setEditingCategory(null)}
                onSelect={handleEditIconSelected}
                currentIcon={editingCategory?.icon}
            />

            {/* Delete Confirm Modal */}
            <Modal
                isOpen={deleteConfirmId !== null}
                onClose={() => setDeleteConfirmId(null)}
                title="Delete Category"
                size="sm"
            >
                <div className="space-y-5">
                    <p className="text-[var(--text-secondary)]">
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-[var(--text-primary)]">
                            {data?.data?.find((c) => c._id === deleteConfirmId)?.name}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[var(--danger)] hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Deleting…
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

interface CategoryCardProps {
    category: Category;
    onEditIcon: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}

function CategoryCard({ category, onEditIcon, onDelete, isDeleting }: CategoryCardProps) {
    return (
        <div className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-[var(--primary)]/50 hover:shadow-md transition-all duration-200">
            {/* Icon Display */}
            <div className="w-16 h-16 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center group-hover:bg-[var(--primary-subtle)] transition-colors">
                <CategoryIcon svg={category.icon} size={34} />
            </div>

            {/* Name & Slug */}
            <div className="text-center w-full">
                <p className="font-semibold text-[var(--text-primary)] truncate leading-snug">{category.name}</p>
                <p className="text-xs font-mono text-[var(--text-tertiary)] mt-0.5 truncate">{category.slug}</p>
            </div>

            {/* Created date */}
            <p className="text-xs text-[var(--text-tertiary)]">
                {format(new Date(category.createdAt), 'MMM d, yyyy')}
            </p>

            {/* Actions */}
            <div className="flex gap-2 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    type="button"
                    onClick={onEditIcon}
                    title="Change icon"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[var(--primary)] bg-[var(--primary-light)] hover:bg-[var(--primary-subtle)] rounded-lg transition-colors"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                    Icon
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    title="Delete category"
                    className="flex items-center justify-center p-1.5 text-[var(--danger)] bg-[var(--danger-light)] hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

export default function CategoriesPage() {
    return (
        <ProtectedRoute requiredPermission="canManageCategories">
            <DashboardLayout>
                <CategoriesContent />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
