import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Award,
  Globe,
  Tv,
  Radio,
  Smartphone,
  Target,
  Heart,
  Star,
  ArrowRight,
  Building,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { icon: Users, label: "Employees", value: "859+" },
  { icon: Tv, label: "TV Channels", value: "2" },
  { icon: Radio, label: "Radio Stations", value: "7" },
  { icon: Globe, label: "Digital Platforms", value: "4+" },
];

const values = [
  {
    icon: Target,
    title: "Excellence",
    description:
      "We strive for the highest standards in everything we do, from content creation to employee development.",
  },
  {
    icon: Heart,
    title: "Integrity",
    description:
      "We operate with honesty, transparency, and ethical practices in all our business dealings.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We are committed to serving our communities and fostering positive social change.",
  },
  {
    icon: Star,
    title: "Innovation",
    description:
      "We embrace new technologies and creative approaches to stay at the forefront of media.",
  },
];

const achievements = [
  "Ethiopia's Most Trusted Media Brand (2023)",
  "Digital Innovation Award (2022)",
  "Best Employer in Media Sector (2022)",
  "Community Service Excellence Award (2021)",
  "Broadcasting Excellence Recognition (2021)",
];

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              About Our Organization
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Shaping Ethiopia's{" "}
              <span className="text-gradient">Media Landscape</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              For over three decades, Amhara Media Corporation has been at the
              forefront of Ethiopian media, delivering trusted news, quality
              entertainment, and educational content that connects communities
              and cultures.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center shadow-soft">
                <CardContent className="pt-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg hero-gradient mb-4">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Established in 2001, Amhara Media Corporation began as a
                  regional broadcaster with a simple mission: to inform,
                  educate, and entertain the people of the Amhara region and
                  beyond. Over the years, we have grown into one of Ethiopia's
                  most respected media organizations.
                </p>
                <p>
                  Our journey has been marked by continuous innovation and
                  expansion. From our humble beginnings with a single radio
                  station, we now operate multiple TV channels, radio stations,
                  and digital platforms that reach millions of viewers and
                  listeners across Ethiopia and the diaspora.
                </p>
                <p>
                  Today, we stand as a testament to the power of quality
                  journalism, creative storytelling, and technological
                  advancement in serving our communities and preserving our rich
                  cultural heritage.
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <Calendar className="h-5 w-5 text-primary mr-2" />
                    <span className="font-semibold">2001</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Founded as Amhara Mass Media Agency with our first radio
                    station
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <Tv className="h-5 w-5 text-primary mr-2" />
                    <span className="font-semibold">2008</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Launched our first television channel, expanding our reach
                    significantly
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <Globe className="h-5 w-5 text-primary mr-2" />
                    <span className="font-semibold">2018</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Embraced digital transformation with online platforms and
                    mobile apps
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do and shape our
              organizational culture.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card key={index} className="text-center shadow-soft">
                <CardHeader>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg hero-gradient mb-4 mx-auto">
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Recognition & Achievements
              </h2>
              <p className="text-lg text-muted-foreground">
                Our commitment to excellence has been recognized by industry
                leaders and communities.
              </p>
            </div>

            <Card className="shadow-medium">
              <CardContent className="p-8">
                <div className="grid gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 rounded-lg bg-muted/50"
                    >
                      <Award className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span className="font-medium">{achievement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Career Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <Card className="shadow-medium hero-gradient text-white">
            <CardContent className="py-12 text-center">
              <Building className="h-12 w-12 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Be part of a dynamic organization that's shaping the future of
                media in Ethiopia. Explore exciting career opportunities and
                grow with us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8"
                  asChild
                >
                  <Link to="/jobs">
                    View Open Positions
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  asChild
                >
                  <Link to="/contact">Contact HR Team</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;
