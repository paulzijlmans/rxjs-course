import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, forkJoin, fromEvent } from "rxjs";
import { map, tap, throttleTime } from "rxjs/operators";
import { createHttpObservable } from "../common/util";
import { Course } from "../model/course";
import { Lesson } from "../model/lesson";

@Component({
  selector: "course",
  templateUrl: "./course.component.html",
  styleUrls: ["./course.component.css"],
})
export class CourseComponent implements OnInit, AfterViewInit {
  courseId: string;
  course$: Observable<Course>;
  lessons$: Observable<Lesson[]>;

  @ViewChild("searchInput", { static: true }) input: ElementRef;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.params["id"];
    const course$ = createHttpObservable(`/api/courses/${this.courseId}`);

    const lessons$ = this.loadLessons();

    forkJoin([course$, lessons$])
      .pipe(
        tap(([course, lessons]) => {
          console.log("course", course);
          console.log("lessons", lessons);
        })
      )
      .subscribe();
  }

  ngAfterViewInit() {
    fromEvent<any>(this.input.nativeElement, "keyup")
      .pipe(
        map((event) => event.target.value),
        throttleTime(500)
      )
      .subscribe(console.log);
  }

  loadLessons(search = ""): Observable<Lesson[]> {
    return createHttpObservable(
      `/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`
    ).pipe(map((res) => res["payload"]));
  }
}
