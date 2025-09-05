class FuelTracker {
    constructor() {
        this.records = this.loadRecords();
        this.form = document.getElementById('fuel-form');
        this.recordsList = document.getElementById('records-list');
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('date').valueAsDate = new Date();
        this.displayRecords();
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const date = document.getElementById('date').value;
        const odometer = parseFloat(document.getElementById('odometer').value);
        const fuelAmount = parseFloat(document.getElementById('fuel-amount').value);
        const price = parseInt(document.getElementById('price').value);
        
        const record = {
            id: Date.now(),
            date,
            odometer,
            fuelAmount,
            price,
            pricePerLiter: Math.round(price / fuelAmount),
            fuelEfficiency: this.calculateFuelEfficiency(odometer, fuelAmount)
        };
        
        this.addRecord(record);
        this.form.reset();
        document.getElementById('date').valueAsDate = new Date();
    }
    
    calculateFuelEfficiency(currentOdometer, fuelAmount) {
        if (this.records.length === 0) {
            return null;
        }
        
        const lastRecord = this.records[this.records.length - 1];
        const distance = currentOdometer - lastRecord.odometer;
        
        if (distance <= 0) {
            return null;
        }
        
        return Math.round((distance / fuelAmount) * 100) / 100;
    }
    
    addRecord(record) {
        this.records.push(record);
        this.saveRecords();
        this.displayRecords();
    }
    
    deleteRecord(id) {
        this.records = this.records.filter(record => record.id !== id);
        this.saveRecords();
        this.displayRecords();
    }
    
    displayRecords() {
        if (this.records.length === 0) {
            this.recordsList.innerHTML = '<p class="no-records">記録がありません</p>';
            return;
        }
        
        const recordsHtml = this.records
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(record => this.createRecordHtml(record))
            .join('');
        
        this.recordsList.innerHTML = recordsHtml;
    }
    
    createRecordHtml(record) {
        const fuelEfficiencyText = record.fuelEfficiency 
            ? `${record.fuelEfficiency} km/L` 
            : '計算不可';
        
        return `
            <div class="record-item">
                <div class="record-header">
                    <span class="record-date">${record.date}</span>
                    <button class="delete-btn" onclick="fuelTracker.deleteRecord(${record.id})">削除</button>
                </div>
                <div class="record-details">
                    <div class="record-detail">
                        <span class="label">走行距離:</span>
                        <span class="value">${record.odometer.toFixed(1)} km</span>
                    </div>
                    <div class="record-detail">
                        <span class="label">給油量:</span>
                        <span class="value">${record.fuelAmount.toFixed(2)} L</span>
                    </div>
                    <div class="record-detail">
                        <span class="label">金額:</span>
                        <span class="value">¥${record.price.toLocaleString()}</span>
                    </div>
                    <div class="record-detail">
                        <span class="label">単価:</span>
                        <span class="value">¥${record.pricePerLiter}/L</span>
                    </div>
                    <div class="record-detail fuel-efficiency">
                        <span class="label">燃費:</span>
                        <span class="value">${fuelEfficiencyText}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    saveRecords() {
        localStorage.setItem('fuelRecords', JSON.stringify(this.records));
    }
    
    loadRecords() {
        const saved = localStorage.getItem('fuelRecords');
        return saved ? JSON.parse(saved) : [];
    }
    
    getAverageFuelEfficiency() {
        const validRecords = this.records.filter(record => record.fuelEfficiency !== null);
        if (validRecords.length === 0) return 0;
        
        const total = validRecords.reduce((sum, record) => sum + record.fuelEfficiency, 0);
        return Math.round((total / validRecords.length) * 100) / 100;
    }
}

const fuelTracker = new FuelTracker();