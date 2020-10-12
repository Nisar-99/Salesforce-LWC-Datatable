## Salesforce LWC Datatable


A `lightning-datatable` component displays tabular data where each column can be displayed based on the data type. this component provides you datatable `search`, `search with column`, `data sort` and `pagination` functionality.


### Attributes

| NAME | TYPE |DEFAULT | REQUIRED | DESCRIPTION |
| :--- | :--- |  :--- | :---: | :--- |
| `key-field` | `text`  | id  |  :heavy_check_mark: | Required for better performance. Associates each row with a `unique`  ID.  |
| `columns`   | `array` |     |  :heavy_check_mark: |  Array of the columns object that's used to define the data types. Required properties include `label`, `fieldName`, and `type`. The default type is `text`. See the `lightning-datatable` Documentation for more information. | 
| `records`   | `array` |     |  :heavy_check_mark: | 	The array of data to be displayed.  |
| `searchable`| `boolean`|  false  |  :x: | For client-side data filtering  |
| `show-page-entries` | `boolean` | false |  :x: | For showing per page records  |
| `show-filter-column`| `boolean` | false |  :x: | For filtering all columns or a particular column  |
| `show-pagination` | `boolean` |  false|  :x: | For data table pagination  |
| `page-size-options` | `array` |   `[10, 25, 50, 100]`  |  :x: | For `page-entries` user options  |
| `hide-checkbox-column`| `boolean`|  false  |  :x: | If present, the checkbox column for row selection is hidden.  |
| `show-row-number-column`| `boolean`|  false  |  :x: | If present, the row numbers are shown in the first column.  |
| `hide-table-header`| `boolean`|  false  |  :x: |  If present, the table header is hidden. |
| `sorted-by`| `text`|  false  |  :x: | 	The column `fieldName` that controls the sorting order. Sort the data using the onsort event handler.  |
| `sorted-direction`| `text`|  false  |  :x: |  Specifies the sorting direction. Sort the data using the onsort event handler. Valid options include `asc` and `desc`. |



#### Usage

`Html:`

```html
<c-datatable 
    key-field="id"
    columns={columns} 
    records={records}
    searchable
    show-page-entries
    show-filter-column
    show-pagination>
</c-datatable>
```
`JavaScript:`

```js
@track columns = [
     {label: 'Opportunity name', fieldName: 'opportunityName', type: 'text'},
     {label: 'Confidence', fieldName: 'confidence', type: 'percent', cellAttributes: { iconName: { fieldName: 'trendIcon' }, iconPosition: 'right' }},
     {label: 'Amount', fieldName: 'amount', type: 'currency', typeAttributes: { currencyCode: 'EUR'}},
     {label: 'Contact Email', fieldName: 'contact', type: 'email'},
     {label: 'Contact Phone', fieldName: 'phone', type: 'phone'},
];

@track records = [{
                    id: 'a',
                    opportunityName: 'Cloudhub',
                    confidence: 0.2,
                    amount: 25000,
                    contact: 'jrogers@cloudhub.com',
                    phone: '2352235235',
                    trendIcon: 'utility:down'
                },
                {
                    id: 'b',
                    opportunityName: 'Quip',
                    confidence: 0.78,
                    amount: 740000,
                    contact: 'quipy@quip.com',
                    phone: '2352235235',
                    trendIcon: 'utility:up'
                }];;

/*More Details: https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/example*/
```



**Output:**

![output]()

>More LWC datatable: [lighting-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/specification) .

 *Thank you.*






