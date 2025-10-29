<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />

            <div class="admin-dashboard">
                <!-- Header -->
                <div class="admin-header">
                    <h1>Database Backup Dashboard</h1>
                </div>

                <!-- Main Content -->
                <div class="admin-content">
                    <!-- Backup Section -->
                    <div class="admin-card">
                        <div class="card-header">
                            <div class="card-title">
                                <div class="icon-wrapper">
                                    <Icon name="database" size="24" class="card-icon" />
                                </div>
                                <div>
                                    <h3>Database Backup</h3>
                                    <p>Create and download database backups</p>
                                </div>
                            </div>
                            <div class="last-backup" v-if="lastBackup">
                                Last backup: {{ formatDate(lastBackup.created_at) }}
                            </div>
                        </div>

                        <div class="card-content">
                            <div class="backup-info">
                                <div class="info-item">
                                    <span class="label">Backup Type:</span>
                                    <span class="value">Full Database Export</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">File Format:</span>
                                    <span class="value">SQL</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Last Backup By:</span>
                                    <span class="value">{{ lastBackup ? lastBackup.user : 'No backups yet' }}</span>
                                </div>
                            </div>

                            <div class="backup-actions">
                                <button @click="takeBackup" :disabled="isBackingUp" class="backup-btn primary">
                                    <span v-if="isBackingUp" class="btn-loading">
                                        <Icon name="loading" size="16" class="btn-icon" />
                                        Creating Backup...
                                    </span>
                                    <span v-else class="btn-content">
                                        <Icon name="download" size="16" class="btn-icon" />
                                        Take & Download Backup
                                    </span>
                                </button>
                            </div>

                            <!-- Backup Progress -->
                            <div v-if="isBackingUp" class="backup-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" :style="{ width: progress + '%' }"></div>
                                </div>
                                <div class="progress-text">{{ Math.round(progress * 100) / 100 }}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../plugins/axios.js'
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";



const isBackingUp = ref(false)
const progress = ref(0)
const lastBackup = ref(null)

// Fetch last backup info when component loads
onMounted(async () => {
    try {
        const response = await api.get('/last-backup/')
        lastBackup.value = response.data
    } catch (error) {
        console.error('Failed to fetch last backup info:', error)
    }
})

const takeBackup = async () => {
    try {
        isBackingUp.value = true
        progress.value = 0

        // Simulate progress
        const progressInterval = setInterval(() => {
            progress.value += Math.random() * 15
            if (progress.value >= 90) {
                clearInterval(progressInterval)
            }
        }, 200)

        const response = await api.get('/backup-db/', {
            responseType: 'blob',
        })

        clearInterval(progressInterval)
        progress.value = 100

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
        link.href = url
        link.setAttribute('download', `backup_${timestamp}.sql`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        // Fetch updated last backup info
        const backupResponse = await api.get('/last-backup/')
        lastBackup.value = backupResponse.data

        setTimeout(() => {
            isBackingUp.value = false
            progress.value = 0
        }, 1000)

    } catch (err) {
        console.error('❌ Backup failed:', err)
        isBackingUp.value = false
        progress.value = 0
        alert('Backup failed — check server logs.')
    }
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString()
}
</script>

<style scoped>
.layout {
    display: flex;
}

.main-content {
    margin-left: 235px;
    flex: 1;
    min-height: 100vh;
    background: #f9fafb;
    padding: 20px;
}

.admin-dashboard {
    min-height: 100vh;
    background: white;
    padding: 20px;
}

.admin-header {
    margin-bottom: 30px;
    text-align: center;
}

.admin-header h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    color: #1f2937;
}

.admin-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    max-width: 600px;
    margin: 0 auto;
}

.admin-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    width: 100%;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.card-title {
    display: flex;
    align-items: center;
    gap: 16px;
}

.icon-wrapper {
    width: 60px;
    height: 60px;
    background: #f3f4f6;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #e5e7eb;
}

.icon {
    font-size: 24px;
}

.card-title h3 {
    margin: 0 0 4px 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
}

.card-title p {
    margin: 0;
    color: #6b7280;
    font-size: 0.9rem;
}

.last-backup {
    background: #f3f4f6;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #6b7280;
}

.card-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.backup-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.label {
    font-size: 0.8rem;
    color: #6b7280;
    font-weight: 500;
}

.value {
    font-size: 0.9rem;
    color: #1f2937;
    font-weight: 600;
}

.backup-actions {
    display: flex;
    justify-content: center;
}

.backup-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
}

.backup-btn.primary {
    background: #10b981;
    color: white;
}

.backup-btn.primary:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
}

.backup-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
}

.btn-loading {
    display: flex;
    align-items: center;
    gap: 8px;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.btn-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-icon {
    font-size: 1.1rem;
}

.backup-progress {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
}

.progress-bar {
    flex: 1;
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #10b981;
    border-radius: 3px;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 0.8rem;
    font-weight: 600;
    color: #374151;
    min-width: 40px;
}

/* Responsive */
@media (max-width: 768px) {
    .admin-header h1 {
        font-size: 1.5rem;
    }

    .card-header {
        flex-direction: column;
        gap: 12px;
        align-items: center;
        text-align: center;
    }

    .backup-info {
        grid-template-columns: 1fr;
    }

    .backup-btn {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .admin-dashboard {
        padding: 16px;
    }

    .admin-card {
        padding: 20px;
    }

    .card-title {
        flex-direction: column;
        text-align: center;
        gap: 12px;
    }
}
</style>