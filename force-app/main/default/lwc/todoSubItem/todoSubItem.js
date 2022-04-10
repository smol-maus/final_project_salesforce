import { LightningElement, api } from 'lwc';
import NAME_FIELD from '@salesforce/schema/SubTodo__c.Name';
import DONE_FIELD from '@salesforce/schema/SubTodo__c.Done__c';
import ID_FIELD from '@salesforce/schema/SubTodo__c.Id';
import { updateRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { reduceErrors } from 'c/ldsUtils';

export default class TodoSubItem extends LightningElement {
    sub;
    editMode = false;

    @api
    set subitem(input) {
        this.sub = JSON.parse(JSON.stringify(input));
    }
    get subitem() {
        return this.sub;
    }

    handleEdit() {
        this.editMode = !this.editMode;
    }

    handleDelete(){
        const recordId = this.sub.Id;
        deleteRecord(recordId)
            .then(() => {
                const subDelete = new CustomEvent('subdelete', {
                    detail: recordId
                });
                this.dispatchEvent(subDelete);
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

    handleSave() {
        let name = this.template.querySelector("[data-field='Name']").value;
        const valid = (name.trim().length === 0) ? false : true;

        if (valid){
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.sub.Id;
            fields[NAME_FIELD.fieldApiName] = name;
            fields[DONE_FIELD.fieldApiName] = this.template.querySelector("[data-field='Done']").checked;
            const recordInput = { fields };
            
            updateRecord(recordInput)
                .then(() => {
                    this.sub.Name = fields.Name;
                    this.sub.Done__c = fields.Done__c;
                    this.handleEdit();

                    const subEdit = new CustomEvent('subedit', {
                        detail: this.sub
                    });
                    this.dispatchEvent(subEdit);
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error creating record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Could not create',
                    message: 'Name must not be empty',
                    variant: 'error'
                })
            );
        }
    }
}