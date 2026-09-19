import React, { useState, useEffect, useRef } from 'react';
import {
  FolderLock,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Eye,
  Trash2,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Modal } from '../../components/common/Modal.js';
import { Input, Select } from '../../components/common/Input.js';
import { DataTable, Column } from '../../components/common/DataTable.js';
import { api } from '../../services/api.js';
import { DocumentItem } from '../../types/index.js';

export const DocumentsVault: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [docName, setDocName] = useState<string>('');
  const [docCategory, setDocCategory] = useState<'ID' | 'Proof of Address' | 'Policy' | 'Tax' | 'Statement'>('ID');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.documents.getAll();
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      setError(err.message || 'Unable to load vault documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!docName) setDocName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!docName) setDocName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;
    setUploading(true);
    try {
      await api.documents.upload({
        name: docName,
        category: docCategory,
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB',
        fileType: selectedFile ? selectedFile.name.split('.').pop()?.toUpperCase() || 'PDF' : 'PDF',
      });
      setIsUploadOpen(false);
      setDocName('');
      setSelectedFile(null);
      fetchDocuments();
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (categoryFilter === 'ALL') return true;
    return d.category === categoryFilter;
  });

  const columns: Column<DocumentItem>[] = [
    {
      key: 'name',
      header: 'Document Name & Spec',
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#F2F2F2] flex items-center justify-center text-[#C62828] font-bold text-xs shrink-0 border border-[#D9D9D9]">
            {d.fileType || 'PDF'}
          </div>
          <div>
            <div className="font-semibold text-[#111111] text-sm">{d.name}</div>
            <div className="text-xs text-[#6B6B6B]">Size: {d.fileSize} • Uploaded: {new Date(d.uploadDate).toLocaleDateString('en-ZA')}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Vault Category',
      render: (d) => (
        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#F2F2F2] text-[#1F1F1F] border border-[#D9D9D9]">
          {d.category}
        </span>
      ),
    },
    {
      key: 'verified',
      header: 'FICA Compliance',
      render: (d) => (
        <div className="flex items-center gap-1.5">
          {d.verified ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Pending Review
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (d) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => alert(`Simulating secure download for "${d.name}.${d.fileType}"`)}
          >
            Download
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">FICA & Compliance Documents Vault</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Encrypted repository for FICA identity verification, tax certificates, and policy contracts.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
          onClick={() => setIsUploadOpen(true)}
        >
          Upload Document
        </Button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'ID', 'Proof of Address', 'Policy', 'Tax', 'Statement'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              categoryFilter === cat
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white border border-[#D9D9D9] text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F2F2F2]'
            }`}
          >
            {cat === 'ALL' ? 'All Documents' : cat}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <Card
        title="Stored Document Records"
        subtitle="All documents are encrypted with AES-256 and restricted to authorized advisers"
      >
        <DataTable
          columns={columns}
          data={filteredDocs}
          keyExtractor={(d) => d.id}
          isLoading={loading}
          emptyTitle="No documents found"
          emptyDescription="Upload your South African Smart ID, municipal utility bill, or tax certificates."
          emptyActionLabel="Upload Document"
          onEmptyAction={() => setIsUploadOpen(true)}
        />
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Secure Document Upload"
        subtitle="Submit documentation to meet FAIS & FICA compliance mandates"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Document Title"
            placeholder="e.g. South African Smart ID Card (Front & Back)"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            required
          />

          <Select
            label="Compliance Document Category"
            value={docCategory}
            onChange={(e) => setDocCategory(e.target.value as any)}
            options={[
              { label: 'Identity Document (SA ID / Passport)', value: 'ID' },
              { label: 'Proof of Residential Address (Utility / Bank Statement < 3 mos)', value: 'Proof of Address' },
              { label: 'Policy Schedule / Underwriting Contract', value: 'Policy' },
              { label: 'Tax Assessment / IRP5 Certificate', value: 'Tax' },
              { label: 'Investment Valuation Statement', value: 'Statement' },
            ]}
          />

          {/* Drag and Drop Zone */}
          <div>
            <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5 uppercase tracking-wider">
              File Attachment
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D9D9D9] hover:border-[#C62828] rounded-lg p-6 text-center cursor-pointer bg-[#F8F9FA] transition-colors"
            >
              <UploadCloud className="w-8 h-8 text-[#6B6B6B] mx-auto mb-2" />
              {selectedFile ? (
                <div>
                  <span className="text-sm font-bold text-[#111111]">{selectedFile.name}</span>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-semibold text-[#111111]">
                    Click to browse or drag and drop document here
                  </span>
                  <p className="text-[11px] text-[#6B6B6B] mt-1">PDF, PNG, JPG, or DOCX (Max 25MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#D9D9D9]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsUploadOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={uploading}
            >
              Upload to Vault
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
