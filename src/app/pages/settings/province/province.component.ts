import { Component, OnInit } from '@angular/core';
import { DictProvince } from 'src/_models/dictProvince';
import { DictProvinceHttpService } from 'src/_services/http/dict-province-http.service';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { ProvinceMoreInfoComponent } from './province-more-info/province-more-info.component';

@Component({
  selector: 'app-province',
  templateUrl: './province.component.html',
  styleUrls: ['./province.component.scss']
})
export class ProvinceComponent implements OnInit {

  displayedColumns = ['id', 'name', 'buttonMore'];
  dictProvinces: DictProvince[] = [];
  dataSource: MatTableDataSource<DictProvince>;

  // PROGRESSBAR
  isLoaded = false; // do sprawdzenia czy dane już są wczytane - wtedy progress bar znika

  constructor(private dictProvinceHttpService: DictProvinceHttpService, private dialog: MatDialog) { }

  ngOnInit() {
    this.dictProvinceHttpService.getDictProvinces().subscribe(src => { // Pobieranie spisu miast z bazy danych
      src.forEach(dict => {
        const province = new DictProvince();
        province.dictProvinceId = dict.dictProvinceId;
        province.name = dict.name;
        this.dictProvinces.push(province);
      });
      this.dataSource = new MatTableDataSource(this.dictProvinces);
      console.log(this.dictProvinces);
      this.isLoaded = true;
    },
      error => {
        console.log(error);
      });
  }

  // Filtrowanie miast
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDetailsModal(viewTable: any, viewTicket: DictProvince, InEditMode: boolean, head: string, createNew: boolean) {
    let ticket = new DictProvince();
    let isNewTicket = false;
    let deleteDict: boolean; // zmienna okreslajaca usuniecie slownika
    const isInEditMode = InEditMode;
    const create = createNew; // jezeli tworzymy nowe radio to true
    deleteDict = false; // zmienna okreslająca usunięcie slownika

    if (viewTicket) {
      Object.assign(ticket, viewTicket);
    } else {
      ticket = new DictProvince();
      isNewTicket = true;
    }

    const detailsModalRef = this.dialog.open(ProvinceMoreInfoComponent, {
      data: { ticket: ticket, isInEditMode: InEditMode, header: head, create: createNew, deleted: deleteDict }
    });

    detailsModalRef.afterClosed().subscribe(result => {
      if (result !== undefined) { // jezeli result nie nie jest undefined
        if (!result.deleted) { // jezeli nie usuwamy slownika
          if (isNewTicket) {  // jezeli tworzymy nowe województwo
            this.dictProvinceHttpService.addDictProvince(result.ticket).subscribe(src => {
              this.dictProvinces.push(result.ticket);
              console.log(src);
              viewTable.renderRows();
            },
              error => {
                console.log(error);
              });
          } else {  // jezeli edytujemy województwo

            this.dictProvinceHttpService.updateDictProvince(result.ticket).subscribe(src => {
              viewTicket.copyValues(ticket);
              console.log(src);
            },
              error => {
                console.log(error);
              });
          }
          viewTable.renderRows();
        } else if (result.deleted) {  // usuwanie slownika z bazy danych
          this.dictProvinceHttpService.deleteDictProvince(result.ticket.dictProvinceId).subscribe(src => {
            console.log(src);
            viewTable.renderRows();
            const index = this.dictProvinces.indexOf(viewTicket);
            if (index > -1) {
              this.dictProvinces.splice(index, 1);
              viewTable.renderRows();
            }
          },
            error => {
              console.log(error);
            });
        }
      }
    });
  }
}
