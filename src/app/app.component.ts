import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

interface Card {
  id: number;
  title: string;
}

interface List {
  name: string;
  cards: Card[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'kanbanboard';

  board: List[] = [];
  newCardTitle: string[] = [];
  newColumnName: string = '';

  showRemove: boolean[] = [];
  private draggedColumnIndex: number | null = null;

  ngOnInit() {
    this.initializeBoard();
    this.showRemove = Array(this.board.length).fill(false);
  }

  toggleRemove(index: number) {
    this.showRemove[index] = !this.showRemove[index]; // Toggle the visibility
  }

  initializeBoard() {
    this.board = [
      { name: 'In Progress', cards: [{ id: 1, title: 'Task 1' }, { id: 2, title: 'Task 2' }] },
      { name: 'Review', cards: [{ id: 3, title: 'Task 3' }] },
      { name: 'Blocked', cards: [{ id: 5, title: 'Task 5' }] },
      { name: 'Done', cards: [{ id: 4, title: 'Task 4' }] },
    ];
  }

  onDragStart(event: DragEvent, listIndex: number, cardIndex: number) {
    event.dataTransfer?.setData('text', JSON.stringify({ listIndex, cardIndex }));
  }

  onDrop(event: DragEvent, toListIndex: number) {
    event.preventDefault();

    const data = event.dataTransfer?.getData('text');
    if (data) {
      const { listIndex: fromListIndex, cardIndex: fromCardIndex } = JSON.parse(data);

      // Prevent dropping in the same list
      if (fromListIndex !== toListIndex) {
        const card = this.board[fromListIndex].cards.splice(fromCardIndex, 1)[0];
        this.board[toListIndex].cards.push(card);
      }
    } else {
      console.log('No data found in event.dataTransfer');
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  addCard(listIndex: number) {
    if (this.newCardTitle[listIndex]) {
      const newCard: Card = {
        id: Date.now(), // Unique ID based on timestamp
        title: this.newCardTitle[listIndex],
      };
      this.board[listIndex].cards.push(newCard);
      this.newCardTitle[listIndex] = ''; // Clear input
    }
  }

  addColumn() {
    if (this.newColumnName) {
      this.board.push({ name: this.newColumnName, cards: [] });
      this.newCardTitle.push(''); // Initialize new card title for new column
      this.newColumnName = ''; // Clear input
    }
  }

  onDragOverBin(event: DragEvent) {
    event.preventDefault(); // Allow dropping
}

onDropBin(event: DragEvent) {
    event.preventDefault();
    const data = event.dataTransfer?.getData('text');
    
    if (data) {
        const { listIndex, cardIndex } = JSON.parse(data);
        
        if (cardIndex !== undefined) {
            // Remove card if it's a card being dropped
            this.removeCard(listIndex, cardIndex);
        } else {
            // Remove column if it's a column being dropped (not possible here, but left for completeness)
            this.removeColumn(listIndex);
        }
    }
}

removeColumn(index: number) {
  this.board.splice(index, 1); // Remove column by index
  this.newCardTitle.splice(index, 1); // Remove corresponding new card title
  this.showRemove.splice(index, 1); // Remove corresponding visibility
}

removeCard(listIndex: number, cardIndex: number) {
  this.board[listIndex].cards.splice(cardIndex, 1); // Remove card by index
}


}