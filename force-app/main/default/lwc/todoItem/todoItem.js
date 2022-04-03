import { LightningElement, api, wire } from 'lwc';
import NAME_FIELD from '@salesforce/schema/Todo__c.Name';
import STATUS_FIELD from '@salesforce/schema/Todo__c.Status__c'
import RECORD_TYPE from '@salesforce/schema/Todo__c.RecordTypeId'
import ID_FIELD from '@salesforce/schema/Todo__c.Id'
import DESCRIPTION_FIELD from '@salesforce/schema/Todo__c.Description__c'
import TODO_OBJECT from '@salesforce/schema/Todo__c';

import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
import { reduceErrors } from 'c/ldsUtils';
import { updateRecord } from 'lightning/uiRecordApi';
const master = 'Master';
const expired = 'Expired';

export default class TodoItem extends LightningElement {
    @api todo;
    @api subs;
    edit = false;
    
    @wire(getObjectInfo, { objectApiName: TODO_OBJECT}) objectInfo;

    get recordTypes() {
        var recordtypeinfo = this.objectInfo.data.recordTypeInfos;
        var uiCombobox = [];
        for(var eachRecordtype in recordtypeinfo)
        {
          if(recordtypeinfo.hasOwnProperty(eachRecordtype)
                && recordtypeinfo[eachRecordtype].name != master
                && recordtypeinfo[eachRecordtype].name != expired
            )
          uiCombobox.push({ label: recordtypeinfo[eachRecordtype].name, value: recordtypeinfo[eachRecordtype].recordTypeId })
        }
        return uiCombobox;
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
    
    handleEdit() {
        this.edit = !this.edit;
    }
    
    handleSubToast(event) {
        const subEvent = new CustomEvent('success', {
            detail: event.detail
        });
        this.dispatchEvent(subEvent);
    }

    updateTodo(event) {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputFields) => {
                inputFields.reportValidity();
                return validSoFar && inputFields.checkValidity();
            }, true);
        if (allValid){
            const fields = {};
            fields[ID_FIELD.fieldApiName] = event.target.dataset.recordid;
            fields[NAME_FIELD.fieldApiName] = this.template.querySelector("[data-field='Name']").value;
            fields[STATUS_FIELD.fieldApiName] = this.template.querySelector("[data-field='Status']").value;
            fields[RECORD_TYPE.fieldApiName] = this.template.querySelector("[data-field='Due']").value;
            fields[DESCRIPTION_FIELD.fieldApiName] = this.template.querySelector("[data-field='Text']").value;
            const recordInput = { fields };
            
            updateRecord(recordInput)
                .then(() => {
                    this.handleEdit();
                    const todoEvent = new CustomEvent('success', {
                        detail: 'Todo updated'
                    });
                    this.dispatchEvent(todoEvent);
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

    tryDelete(event) {
        const recordId = event.target.dataset.recordid;
        deleteRecord(recordId)
            .then(() => {
                const deleteEvent = new CustomEvent('success', {
                    detail: 'Todo deleted'
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
}