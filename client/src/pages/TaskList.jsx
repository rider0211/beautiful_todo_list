import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { TaskService } from '../services/TaskService';
import { ProjectService } from '../services/ProjectService';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';
import { Dropdown } from 'primereact/dropdown';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import Pusher from 'pusher-js';

export default function TaskList() {
    const navigate = useNavigate();
    const { id } = useParams();
    let emptyTask = {
        project_id: id,
        title: '',
        status: 0,
        description: '',
        from: format(toZonedTime(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone), 'yyyy-MM-dd'),
        to: format(toZonedTime(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone), 'yyyy-MM-dd'),
    };

    const [taskList, setTaskList] = useState(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        title: { value: null, matchMode: FilterMatchMode.CONTAINS },
        description: { value: null, matchMode: FilterMatchMode.CONTAINS },
        status: { value: null, matchMode: FilterMatchMode.EQUALS },
    });
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedTasks, setSelctedTasks] = useState(null);
    const [task, setTask] = useState(emptyTask);
    const [deleteTaskDialog, setDeleteTaskDialog] = useState(false);
    const [deleteTasksDialog, setDeleteTasksDialog] = useState(false);
    const [taskDialog, setTaskDialog] = useState(false);
    const [newTask, setNewTask] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const dt = useRef(null);
    const toast = useRef(null);
    const [statuses] = useState([0, 1, 2]);
    const [statusName] = useState(['pending', 'in progress', 'completed']);
    const getSeverity = (status) => {
        switch (status) {
            case 0:
                return 'info';

            case 1:
                return 'warning';

            case 2:
                return 'success';
        }
    };

    useEffect(() => {
        const pusher = new Pusher('1c62467c916ffc537d24', {
            cluster: 'us2',
        });
        const channel = pusher.subscribe('task-channel');
        channel.bind('task.status.updated', (data) => {
            alert("this is new event");
        });
        return () => {
            pusher.unsubscribe('task-channel');
        };
    }, []);
    
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const projectData = await ProjectService.getProjectById(id);
                setTaskList(projectData.tasks);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching tasks:", error);
                setLoading(false);
            }
        };

        fetchTasks();
    }, [id]);

    const hideDialog = () => {
        setSubmitted(false);
        setTaskDialog(false);
    };
    const hideDeleteTaskDialog = () => {
        setDeleteTaskDialog(false);
    };

    const hideDeleteTasksDialog = () => {
        setDeleteTasksDialog(false);
    };

    const confirmDeleteTask = (product) => {
        setTask(product);
        setDeleteTaskDialog(true);
    };

    const confirmDeleteSelected = () => {
        setDeleteTasksDialog(true);
    };

    const deleteTask = async () => {
        try {
            await TaskService.deleteTask(task.id);
            setTaskList(taskList.filter(t => t.id !== task.id));
            setDeleteTaskDialog(false);
            setTask(emptyTask);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Task Deleted', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete task', life: 3000 });
        }
    };

    const editTask = (task) => {
        setTask({ ...task });
        setNewTask(false);
        setTaskDialog(true);
    };

    const deleteSelectedTasks = async () => {
        const taskIds = selectedTasks.map(task => task.id);
        try {
            await TaskService.deleteSelectedTasks(taskIds);
            setTaskList(taskList.filter(task => !selectedTasks.includes(task)));
            setDeleteTasksDialog(false);
            setSelctedTasks(null);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Tasks Deleted', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete tasks', life: 3000 });
        }
    };

    const saveTask = async () => {
        if (task.title.trim()) {
            try {
                let updatedTasks = [...taskList];
                if (task.id) {
                    const index = updatedTasks.findIndex(t => t.id === task.id);
                    if (index !== -1) {
                        const updatedTask = await TaskService.updateTask(task);
                        updatedTasks[index] = updatedTask;
                        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Task Updated', life: 3000 });
                    }
                } else {
                    const addedTask = await TaskService.addTask(task);
                    updatedTasks.push(addedTask);
                    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Task Created', life: 3000 });
                }

                setTaskList(updatedTasks);
                setTaskDialog(false);
                setTask(emptyTask);
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save task', life: 3000 });
            }
        }
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const openNew = () => {
        setTask(emptyTask);
        setSubmitted(false);
        setNewTask(true);
        setTaskDialog(true);
    };

    const onInputChange = (e, name) => {
        let val = e.target && e.target.value !== null ? e.target.value : '';
        if (name === 'from' || name === 'to') {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const zonedDate = toZonedTime(val, timeZone);
            val = format(zonedDate, 'yyyy-MM-dd');
        }
        let _task = { ...task };
        _task[`${name}`] = val;
        setTask(_task);
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
                <h2>Task List</h2>
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </IconField>
            </div>
        );
    };
    const backProjectList = () => {
        navigate('/');
    }


    const handleStatusChange = async (e, rowData, editorCallback) => {
        editorCallback(e.value);
        const newStatus = e.value;
        const updatedTaskList = taskList.map(task =>
            task.id === rowData.id ? { ...task, status: newStatus } : task
        );
        setTaskList(updatedTaskList);
        try {
            await TaskService.updateTaskStatus(rowData.id, newStatus);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Task status updated', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to update status', life: 3000 });
        }
    };
    const statusCellEditorTemplate = ({ value, rowData, editorCallback }) => {
        return (
            <Dropdown value={value} valueTemplate={selectedValueTemplate} options={statuses} onChange={(e) => handleStatusChange(e, rowData, editorCallback)} itemTemplate={statusItemTemplate} placeholder="Select One" className="p-column-filter" style={{ minWidth: '12rem' }} />
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="back" icon="pi pi-replay" severity="info" onClick={backProjectList} />
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedTasks || !selectedTasks.length} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
    };

    const statusBodyTemplate = (rowData) => {
        return <Tag value={statusName[rowData.status]} severity={getSeverity(rowData.status)} />;
    };

    const selectedValueTemplate = (option, props) => {
        return option !== null ? statusName[option] : props.placeholder;
    };

    const statusItemTemplate = (option) => {
        return <Tag value={statusName[option]} severity={getSeverity(option)} />;
    };

    const statusRowFilterTemplate = (options) => {
        return (
            <Dropdown value={options.value} valueTemplate={selectedValueTemplate} options={statuses} onChange={(e) => options.filterApplyCallback(e.value)} itemTemplate={statusItemTemplate} placeholder="Select One" className="p-column-filter" showClear style={{ minWidth: '12rem' }} />
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editTask(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteTask(rowData)} />
            </React.Fragment>
        );
    };

    const deleteTaskDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteTaskDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteTask} />
        </React.Fragment>
    );
    const deleteTasksDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteTasksDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedTasks} />
        </React.Fragment>
    );

    const taskDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveTask} />
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
                    value={taskList}
                    paginator rows={10}
                    dataKey="id"
                    selection={selectedTasks}
                    onSelectionChange={(e) => setSelctedTasks(e.value)}
                    filters={filters}
                    filterDisplay="row"
                    loading={loading}
                    editMode="cell"
                    globalFilterFields={['title', 'description', 'status']}
                    header={header}
                    emptyMessage="No task found."
                    selectionMode={'checkbox'}>
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column field="title" header="Title" filter filterPlaceholder="Filter" style={{ minWidth: '12rem' }} />
                    <Column field="description" header="Description" filter filterPlaceholder="Filter" style={{ minWidth: '12rem' }} />
                    <Column field="from" header="From" style={{ minWidth: '12rem' }} />
                    <Column field="to" header="To" style={{ minWidth: '12rem' }} />
                    <Column field="status" header="Status" showFilterMenu={false} filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '12rem' }} body={statusBodyTemplate} filter filterElement={statusRowFilterTemplate} editor={(options) => statusCellEditorTemplate(options)} />
                    <Column header="Action" body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={taskDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header={newTask ? "Add New Task" : "Task Details"} modal className="p-fluid" footer={taskDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="title" className="font-bold">
                        Title
                    </label>
                    <InputText id="title" value={task.title} onChange={(e) => onInputChange(e, 'title')} required autoFocus className={classNames({ 'p-invalid': submitted && !task.title })} />
                    {submitted && !task.title && <small className="p-error">Title is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="description" className="font-bold">
                        Description
                    </label>
                    <InputTextarea id="description" value={task.description} onChange={(e) => onInputChange(e, 'description')} required rows={3} cols={20} />
                </div>
                <div className="field">
                    <label htmlFor="status" className="font-bold">
                        Status
                    </label>
                    <Dropdown value={task.status} valueTemplate={selectedValueTemplate} options={statuses} onChange={(e) => onInputChange(e, 'status')} itemTemplate={statusItemTemplate} placeholder="Select One" className="p-column-filter" style={{ minWidth: '12rem' }} />
                </div>
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="from" className="font-bold">
                            From
                        </label>
                        <Calendar id="from" value={new Date(task.from)} onChange={(e) => onInputChange(e, 'from')} readOnlyInput />
                    </div>
                    <div className="field col">
                        <label htmlFor="to" className="font-bold">
                            To
                        </label>
                        <Calendar id="to" value={new Date(task.to)} onChange={(e) => onInputChange(e, 'to')} minDate={new Date(task.from)} readOnlyInput />
                    </div>
                </div>
            </Dialog>

            <Dialog visible={deleteTaskDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteTaskDialogFooter} onHide={hideDeleteTaskDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {task && (
                        <span>
                            Are you sure you want to delete <b>{task.title}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
            <Dialog visible={deleteTasksDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteTasksDialogFooter} onHide={hideDeleteTasksDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {taskList && <span>Are you sure you want to delete the selected tasks?</span>}
                </div>
            </Dialog>
        </div>
    );
}
