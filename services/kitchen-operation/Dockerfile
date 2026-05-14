FROM gradle:9.4.0-jdk25 AS build

WORKDIR /workspace

COPY settings.gradle build.gradle ./

COPY src ./src
RUN gradle bootJar --no-daemon -x test

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /workspace/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
