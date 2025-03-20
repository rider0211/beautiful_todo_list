import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { ProjectService } from '../services/ProjectService';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';

export default function ProjectList() {
    const navigate = useNavigate();
    let emptyProject = {
        id: null,
        name: '',
        description: '',
        task_progress: 0
    };
    const [projectList, setProjectList] = useState(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        description: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedProjects, setSelctedProjects] = useState(null);
    const [selectedProjectList, setSelectedProjectList] = useState(null);
    const [project, setProject] = useState(emptyProject);
    const [deleteProjectDialog, setDeleteProjectDialog] = useState(false);
    const [deleteProjectsDialog, setDeleteProjectsDialog] = useState(false);
    const [projectDialog, setProjectDialog] = useState(false);
    const [newProject, setNewProject] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const dt = useRef(null);
    const toast = useRef(null);

    useEffect(() => {
        ProjectService.getProjects().then((data) => {
            setProjectList(data);
            setLoading(false);
        }).catch((error) => {
            setLoading(false);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch projects', life: 3000 });
        });
    }, []);

    const hideDialog = () => {
        setSubmitted(false);
        setProjectDialog(false);
    };
    const hideDeleteProjectDialog = () => {
        setDeleteProjectDialog(false);
    };

    const hideDeleteProjectsDialog = () => {
        setDeleteProjectsDialog(false);
    };

    const confirmDeleteProject = (project) => {
        setProject(project);
        setDeleteProjectDialog(true);
    };

    const confirmDeleteSelected = () => {
        setDeleteProjectsDialog(true);
    };

    const deleteProject = () => {
        ProjectService.deleteProject(project.id).then(() => {
            const updatedProjectList = projectList.filter((p) => p.id !== project.id);
            setProjectList(updatedProjectList);
            setDeleteProjectDialog(false);
            setProject(emptyProject);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Project Deleted', life: 3000 });
        }).catch((error) => {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete project', life: 3000 });
        });
    };

    const viewTasks = (project) => {
        navigate(`${project.id}`)
    }
    const editProject = (project) => {
        setProject({ ...project });
        setNewProject(false);
        setProjectDialog(true);
    };

    const deleteSelectedProjects = () => {
        const projectIds = selectedProjects.map((project) => project.id);
        ProjectService.deleteSelectedProjects(projectIds)
            .then(() => {
                const updatedProjectList = projectList.filter((project) => !projectIds.includes(project.id));
                setProjectList(updatedProjectList);
                setDeleteProjectsDialog(false);
                setSelectedProjectList(null);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Selected projects have been deleted.', life: 3000 });
            })
            .catch((error) => {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete selected projects.', life: 3000 });
            });
    };

    const saveProject = () => {
        setSubmitted(true);

        if (project.name.trim()) {
            if (project.id) {
                ProjectService.updateProject(project).then((updatedProject) => {
                    const updatedProjectList = projectList.map((p) => p.id === updatedProject.id ? updatedProject : p);
                    setProjectList(updatedProjectList);
                    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Project Updated', life: 3000 });
                    setProjectDialog(false);
                });
            } else {
                ProjectService.addProject(project).then((newProject) => {
                    setProjectList([...projectList, newProject]);
                    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Project Created', life: 3000 });
                    setProjectDialog(false);
                });
            }
        }
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const openNew = () => {
        setProject(emptyProject);
        setSubmitted(false);
        setNewProject(true);
        setProjectDialog(true);
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _project = { ...project };

        _project[`${name}`] = val;

        setProject(_project);
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between align-content-center">
                <h2>Project List</h2>
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </IconField>
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProjects || !selectedProjects.length} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
    };

    const progressBodyTemplate = (rowData) => {
        return <ProgressBar value={rowData.task_progress} showValue={false} style={{ height: '6px' }} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-eye" rounded outlined className="mr-2" onClick={() => viewTasks(rowData)} />
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editProject(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteProject(rowData)} />
            </React.Fragment>
        );
    };

    const deleteProjectDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteProjectDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteProject} />
        </React.Fragment>
    );
    const deleteProjectsDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteProjectsDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedProjects} />
        </React.Fragment>
    );

    const projectDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveProject} />
        </React.Fragment>
    );

    const header = renderHeader();

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable
                    ref={dt}
                    value={projectList}
                    paginator rows={10}
                    dataKey="id"
                    selection={selectedProjects}
                    onSelectionChange={(e) => setSelctedProjects(e.value)}
                    filters={filters}
                    filterDisplay="row"
                    loading={loading}
                    globalFilterFields={['name', 'description']}
                    header={header}
                    emptyMessage="No project found.">
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column field="name" header="Name" filter filterPlaceholder="Filter" style={{ minWidth: '12rem' }} />
                    <Column field="description" header="Description" filter filterPlaceholder="Filter" style={{ minWidth: '12rem' }} />
                    <Column field="task_progress" header="Progress" sortable body={progressBodyTemplate} />
                    <Column header="Action" body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={projectDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header={newProject ? "Add New Project" : "Project Details"} modal className="p-fluid" footer={projectDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="name" className="font-bold">
                        Name
                    </label>
                    <InputText id="name" value={project.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !project.name })} />
                    {submitted && !project.name && <small className="p-error">Name is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="description" className="font-bold">
                        Description
                    </label>
                    <InputTextarea id="description" value={project.description} onChange={(e) => onInputChange(e, 'description')} required rows={3} cols={20} />
                </div>
            </Dialog>

            <Dialog visible={deleteProjectDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteProjectDialogFooter} onHide={hideDeleteProjectDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {project && (
                        <span>
                            Are you sure you want to delete <b>{project.name}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
            <Dialog visible={deleteProjectsDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteProjectsDialogFooter} onHide={hideDeleteProjectsDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {projectList && <span>Are you sure you want to delete the selected projects?</span>}
                </div>
            </Dialog>
        </div>
    );
}
