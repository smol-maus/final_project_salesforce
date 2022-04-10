import { LightningElement, api, track } from 'lwc';
import NAME_FIELD from '@salesforce/schema/Todo__c.Name';
import STATUS_FIELD from '@salesforce/schema/Todo__c.Status__c'
import RECORD_TYPE from '@salesforce/schema/Todo__c.RecordTypeId'
import ID_FIELD from '@salesforce/schema/Todo__c.Id'
import DESCRIPTION_FIELD from '@salesforce/schema/Todo__c.Description__c'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { reduceErrors } from 'c/ldsUtils';
import { updateRecord } from 'lightning/uiRecordApi';

export default class TodoItem extends NavigationMixin(LightningElement) {

    @api rtypes;
    @track todo;
    @track subs;

    editState = false;

    @api
    set todoitem(input) {
        this.todo = JSON.parse(JSON.stringify(input));
    }
    get todoitem() {
        return this.todo;
    }
    @api
    set subitems(input) {
        this.subs = JSON.parse(JSON.stringify(input));
    }
    get subitems() {
        return this.subs;
    }

    handleEditState() {
        this.editState = !this.editState;
    }

    createSub(event) {
        if (this.subs == null) {
            this.subs = [event.detail];
        } else {
            this.subs.push(event.detail);
        }
        this.sendUpdateEvent();
    }
    
    updateSub(event) {
        for (let i = 0; i < this.subs.length; i++) {
            if (this.subs[i].Id == event.detail.Id) {
                this.subs.splice(i, 1, event.detail);
                break;
            }
        }
        this.sendUpdateEvent();
    }

    deleteSub(event) {
        for (let i = 0; i < this.subs.length; i++) {
            if (this.subs[i].Id == event.detail) {
                this.subs.splice(i, 1);
                break;
            }
        }
        this.sendUpdateEvent();
    }

    updateTodo(event) {
        let name = this.template.querySelector("[data-field='Name']").value;
        const valid = (name.trim().length === 0) ? false : true;

        if (valid){
            const fields = {};
            fields[ID_FIELD.fieldApiName] = event.target.dataset.recordid;
            fields[NAME_FIELD.fieldApiName] = name;
            fields[STATUS_FIELD.fieldApiName] = this.template.querySelector("[data-field='Status']").value;
            fields[RECORD_TYPE.fieldApiName] = this.template.querySelector("[data-field='Due']").value;
            fields[DESCRIPTION_FIELD.fieldApiName] = this.template.querySelector("[data-field='Text']").value;
            const recordInput = { fields };

            updateRecord(recordInput)
                .then(() => {
                    this.todo.Name = fields.Name;                
                    this.todo.RecordTypeId = fields.RecordTypeId;
                    for (let obj of this.rtypes) {
                        if (obj.value == fields.RecordTypeId) {
                            this.todo.RecordType.Name = obj.label;
                            break;
                        }
                    }
                    this.todo.Status__c = fields.Status__c;
                    this.todo.Description__c = fields.Description__c;

                    this.handleEditState();
                    this.sendUpdateEvent();
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error creating record',
                            message: reduceErrors(error).join(', '),
                            variant: 'error'
                        })
                    );
                });
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Could not create',
                    message: 'Check fields',
                    variant: 'error'
                })
            );
        }
    }

    deleteTodo() {
        const recordId = this.todo.Id;
        deleteRecord(recordId)
            .then(() => {
                const deleteEvent = new CustomEvent('tododelete', {
                    detail: recordId
                });
                this.dispatchEvent(deleteEvent);
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: reduceErrors(error).join(', '),
                        variant: 'error'
                    })
                );
            });
    }

    sendUpdateEvent() {
        const updateEvent = new CustomEvent('todoedit', {
            detail: {value:this.subs, key:this.todo}
        });
        this.dispatchEvent(updateEvent);
    }

    navigateToRecord() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.todo.Id,
                objectApiName: 'Todo',
                actionName: 'view'
            }
        });
    }

    get statusIcon() {
        if (this.todo.Status__c == 'Ready to Take'){
            return 'action:priority';
        } else if (this.todo.Status__c == 'In progress') {
            return 'action:defer';
        }
        return 'action:check';
    }

    get statuses() {
        return [
            { label: 'Ready to Take', value: 'Ready to Take' },
            { label: 'In progress', value: 'In progress' },
            { label: 'Done', value: 'Done' },
        ];
    }
}