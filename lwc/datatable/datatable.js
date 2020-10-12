import { LightningElement, api, track } from 'lwc';

const PAGINATION_STEP = 3;
const PREVIOUS_BUTTON = '&#9668;';
const NEXT_BUTTON = '&#9658;';
const THREE_DOTS = '...';
const SEARCH_DELAY = 300; // Wait 300 ms after user stops typing then, peform search

export default class Datatable extends LightningElement {

    /*------------- Public - Custom Properties -----------*/

    @api searchable = false;
    @api showPageEntries = false;
    @api showFilterColumn = false;
    @api showPagination = false;
    @api pageSizeOptions = [10, 25, 50, 100];

    /*------------- Public - Datatable Standard Properties -----------*/

    @api keyField = 'id';
    @api columns;
    @api hideTableHeader = false;
    @api showRowNumberColumn = false;
    @api hideCheckboxColumn = false;
    @api sortedBy;
    @api sortedDirection;

    @api maxColumnWidth = '1000px';
    @api maxRowSelection = 100000000;

    /*----------------------- UI Track ------------------------*/

    @track data = [];

    /*------------------------ Private ------------------------*/
    dataCollection = [];
    pageSize;
    pageNumber = 1;
    hasRendered = false;
    searchThrottlingTimeout;
    filteredRecordHolder = [];
    paginationCode = [];


    @api
    get records() {
        return this.records;
    }
    set records(value) {
        this.data = Object.assign([], value);
        this.dataCollection = Object.assign([], value);
    }

    renderedCallback() {
        if (this.hasRendered) return;
        this.hasRendered = true;
        if (this.showPagination) {
            this.setDefaultView();
            this.startPagination();
        }
    }

    setDefaultView() {
        this.pageSize = this.getSelectedPaging();
        this.data = this.data.splice(0, this.pageSize);
    }

    setRecordsToDisplay() {
        let pageSize = this.getSelectedPaging();
        let lastPosition = (pageSize * this.pageNumber);
        let firstPosition = (lastPosition - pageSize);
        let records = Object.assign([], ((this.getSearchTerm().length && this.filteredRecordCount) ? this.filteredRecordHolder : this.dataCollection));
        this.data = Object.assign([], ((this.showPageEntries || this.showPagination) ? records.slice(firstPosition, lastPosition) : this.filteredRecordHolder));
    }

    /* ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ Table Paginations ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ */

    paginationAdd(start, end) { // Add Pages by number (from [start] to [end])
        for (let index = start; index < end; index++) {
            this.paginationCode.push(index);
        }
    }

    paginationFirst() {  // Add First Page With Separator
        this.paginationCode = [...this.paginationCode, 1, THREE_DOTS];
    }

    paginationLast() { // Add Last Page With Separator
        this.paginationCode = [...this.paginationCode, THREE_DOTS, this.getCountOfTotalPages()];
    }

    paginationCreateOnDOM() {
        let data = [PREVIOUS_BUTTON, ...this.paginationCode, NEXT_BUTTON];
        this.paginationCode = [];

        let paginationContainer = this.template.querySelector('[data-pagination]');
        paginationContainer.innerHTML = '';

        data.forEach(item => {
            let element = document.createElement("div");
            element.innerHTML = item;
            element.dataset.pageNumber = item;
            if (item == this.pageNumber) {
                element.classList.add('active-button');
            }
            if (item == PREVIOUS_BUTTON) {
                element.addEventListener("click", this.previousPage.bind(this));
            } else if (item == NEXT_BUTTON) {
                element.addEventListener("click", this.nextPage.bind(this));
            } else if (item == THREE_DOTS) {
                element.classList.add('more-button');
            } else {
                element.addEventListener("click", this.paginationWithPageNumber.bind(this));
            }
            paginationContainer.appendChild(element);
        });
    }

    previousPage() {
        if (!this.hasDataInTable) {
            return;
        }
        this.pageNumber--;
        if (this.pageNumber < 1) {
            this.pageNumber = 1;
        }
        this.setDataAccordingToPagination();
    }

    nextPage() {
        if (!this.hasDataInTable) {
            return;
        }
        this.pageNumber++;
        if (this.pageNumber > this.getCountOfTotalPages()) {
            this.pageNumber = this.getCountOfTotalPages();
        }
        this.setDataAccordingToPagination();
    }

    paginationWithPageNumber(event) {
        let selectedPageNumber = event.currentTarget.dataset.pageNumber;
        if (selectedPageNumber == THREE_DOTS) {
            return;
        }
        this.pageNumber = parseInt(selectedPageNumber);
        this.setDataAccordingToPagination();
    }

    setDataAccordingToPagination() {
        this.setRecordsToDisplay();
        this.startPagination();
    }

    getCountOfTotalPages() {
        return Math.ceil(((this.filteredRecordCount ? this.filteredRecordCount : (this.hasDataInTable ? this.totalNumberOfRows : 0)) / this.getSelectedPaging()));
    }

    startPagination() {
        if (!this.showPagination) {
            return;
        }
        let totalPages = this.getCountOfTotalPages();
        if (totalPages < PAGINATION_STEP * 2 + 6) {
            this.paginationAdd(1, totalPages + 1);
        } else if (this.pageNumber < PAGINATION_STEP * 2 + 1) {
            this.paginationAdd(1, PAGINATION_STEP * 2 + 4);
            this.paginationLast();
        } else if (this.pageNumber > totalPages - PAGINATION_STEP * 2) {
            this.paginationFirst();
            this.paginationAdd(totalPages - PAGINATION_STEP * 2 - 2, totalPages + 1);
        } else {
            this.paginationFirst();
            this.paginationAdd(this.pageNumber - PAGINATION_STEP, this.pageNumber + PAGINATION_STEP + 1);
            this.paginationLast();
        }
        this.paginationCreateOnDOM();
    }

    /* ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ Table Page Entries ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ */

    handlePageEntries(event) {
        this.pageNumber = 1;
        this.setDataAccordingToPagination();
    }

    /* ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ Table Filter Functions ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ */

    dataFilter(fieldName, searchTerm) {
        let filteredItems = [];
        if (fieldName == 'all') {
            filteredItems = this.dataCollection.filter(o => Object.keys(o).some(k => o[k].toLowerCase().includes(searchTerm)));
        } else {
            filteredItems = this.dataCollection.filter(result => result[fieldName].toLowerCase().includes(searchTerm));
        }
        this.filteredRecordHolder = filteredItems;
        let filteredRecords = Object.assign([], filteredItems);
        this.data = Object.assign([], ((this.showPageEntries || this.showPagination) ? filteredRecords.slice(0, this.getSelectedPaging()) : filteredRecords));
        this.startPagination();
    }


    handleSearching(event) {
        let searchTerm = event.target.value;
        // Apply search throttling (prevents search if user is still typing)
        if (this.searchThrottlingTimeout) {
            window.clearTimeout(this.searchThrottlingTimeout);
        }

        this.searchThrottlingTimeout = window.setTimeout((self) => {
            searchTerm = searchTerm.trim().replace(/\*/g, '').toLowerCase();
            self.pageNumber = 1;
            if (searchTerm.length) {
                self.dataFilter(self.getSelectedFilter(), searchTerm);
            } else {
                self.filteredRecordHolder = [];
                self.setDataAccordingToPagination();
            }
            self.searchThrottlingTimeout = null;
        }, SEARCH_DELAY, this);
    }

    handleFilterByColumn(event) {
        let searchTerm = this.getSearchTerm();
        if (searchTerm.length) {
            this.dataFilter(event.target.value, searchTerm);
        } else {
            this.pageNumber = 1;
            this.setDataAccordingToPagination();
        }
    }

    /* ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ Table Sort Functions ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ */

    handleColumnSorting(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        this.sortData(this.sortedBy, this.sortedDirection);
    }

    sortData(fieldName, direction) {
        let result = Object.assign([], this.data);
        this.data = result.sort((a, b) => {
            if (a[fieldName] < b[fieldName])
                return direction === 'asc' ? -1 : 1;
            else if (a[fieldName] > b[fieldName])
                return direction === 'asc' ? 1 : -1;
            else
                return 0;
        })
    }

    /* ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ Common use Getter ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ */

    getSelectedFilter() {
        let input = this.template.querySelector('[data-filter-input]');
        return input ? input.value : 'all';
    }
    getSearchTerm() {
        let input = this.template.querySelector('[data-search-input]');
        return input ? input.value.trim().replace(/\*/g, '').toLowerCase() : '';
    }
    getSelectedPaging() {
        let input = this.template.querySelector('[data-show-entries-input]');
        return input ? parseInt(input.value) : 10;
    }

    /* ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ Getter ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ */

    get hasHeader() {
        return (this.searchable || this.showPageEntries || this.showFilterColumn);
    }

    get tableStyle() {
        return (this.searchable || this.showPageEntries || this.showPagination) ? 'table__border' : 'table__height';
    }

    get hasRecords() {
        return (this.dataCollection.length ? true : false);
    }

    get hasDataInTable() {
        return this.data.length;
    }
    get filteredRecordCount() {
        return this.filteredRecordHolder.length;
    }

    get pageLengthDefaultValue() {
        return (this.pageSizeOptions.length ? this.pageSizeOptions[0].toString() : '10');
    }

    get totalNumberOfRows() {
        return (this.dataCollection ? this.dataCollection.length : 0);
    }

    get columnFilterOptions() {
        let columnOptions = this.columns.map(obj => {
            return { label: obj.label, value: obj.fieldName };
        });
        return [{ label: 'All', value: 'all' }, ...columnOptions];
    }

    get showingEntriesMessage() {
        let message = '', pages = 0, lastRecordNumber = 0, start = 0, end = 0, pageEntries = this.getSelectedPaging();
        if (this.getSearchTerm().length) {
            pages = (this.filteredRecordCount / pageEntries);
            lastRecordNumber = (this.pageNumber * pageEntries);
            end = (this.filteredRecordCount >= lastRecordNumber) ? lastRecordNumber : this.filteredRecordCount;
            start = ((pages > 1) ? ((this.filteredRecordCount == end) ? this.filteredRecordCount : ((end - pageEntries) + 1)) : (this.hasDataInTable ? 1 : 0));
            message = `Showing ${start} to ${end} of ${this.filteredRecordCount} entries (filtered from ${this.totalNumberOfRows} total entries)`;
        } else {
            pages = (this.totalNumberOfRows / pageEntries);
            lastRecordNumber = (this.pageNumber * pageEntries);
            end = ((this.totalNumberOfRows >= lastRecordNumber) ? lastRecordNumber : this.totalNumberOfRows);
            start = ((pages > 1) ? ((this.totalNumberOfRows == end) ? this.totalNumberOfRows : ((end - pageEntries) + 1)) : (this.hasDataInTable ? 1 : 0));
            message = `Showing ${start} to ${end} of ${this.totalNumberOfRows} entries`;
        }
        return message;
    }

    get pageLengthOptions() {
        return this.pageSizeOptions.map(x => {
            return { label: x.toString(), value: x.toString() };
        });
    }

    /* END */
}