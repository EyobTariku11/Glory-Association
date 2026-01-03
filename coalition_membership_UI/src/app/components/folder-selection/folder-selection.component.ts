import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-folder-selection',
  templateUrl: './folder-selection.component.html',
  styleUrls: ['./folder-selection.component.scss']
})
export class FolderSelectionComponent implements OnInit {

  ngOnInit(): void {
    
  }

  @Output() folderSelected = new EventEmitter<string>();
  selectedFolderPath: string = '';

  selectFolder() {
    // Implement folder selection logic here, e.g., using a modal or custom UI.
    // Once a folder is selected, set `this.selectedFolderPath` to the selected path.
    // For this example, we'll use a placeholder path.
    this.selectedFolderPath = '/path/to/selected/folder';
    this.folderSelected.emit(this.selectedFolderPath);
  }

}
