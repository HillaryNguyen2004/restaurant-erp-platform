FROM gradle:9.4.0-jdk25 AS build

WORKDIR /workspace

COPY settings.gradle build.gradle ./

COPY src ./src
RUN gradle bootJar --no-daemon -x test \
    && cp build/libs/*-SNAPSHOT.jar /workspace/app.jar \
    && test -s /workspace/app.jar

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /workspace/app.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
